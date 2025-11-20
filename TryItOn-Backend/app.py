from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import os
import requests
import base64
import io
import httpx
from openai import OpenAI
from PIL import Image
import replicate
import traceback
import warnings
import uuid
import subprocess
import tempfile

warnings.filterwarnings('ignore')
os.environ['ORT_DISABLE_CUDA'] = '1'

# === Load environment variables ===
load_dotenv()

TRIPOSR_PYTHON = r"C:\Users\anshu\miniconda3\envs\tryiton39\python.exe"

# === OpenAI setup ===
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
http_client = httpx.Client(timeout=120.0, follow_redirects=True)
client = OpenAI(api_key=OPENAI_API_KEY, http_client=http_client)

# === Replicate setup ===
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# === Supabase setup ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Cloudinary setup ===
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# === Flask App ===
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# =====================================================
# ==================== ROUTES ==========================
# =====================================================

# Uploads Selected Images To Cloudinary and Save Url To Supabase
@app.route("/upload", methods=["POST"])
def upload_image():
    """ Upload a single image to Cloudinary AND save to Supabase """
    if "file" not in request.files:
        return jsonify({"error": "No file found"}), 400

    try:
        # ---- Upload to Cloudinary ----
        uploaded_file = request.files["file"]
        result = cloudinary.uploader.upload(uploaded_file)

        cloud_url = result["secure_url"]
        cloud_id = result["public_id"]

        # ---- Save to Supabase ----
        supabase.table("user_images").insert({
            "image_url": cloud_url,
            "cloudinary_id": cloud_id
            # created_at is auto-set by Supabase
        }).execute()

        # ---- Return Response ----
        return jsonify({
            "url": cloud_url,
            "public_id": cloud_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetches All The Non-Edited Uploads 
@app.route("/get_uploads", methods=["GET"])
def get_uploads():
    """ Return all original images """
    data = supabase.table("user_images").select("*").execute()
    return jsonify(data.data), 200

# Runs The Tryon_Flux Model on the Original Image
@app.route("/tryon_flux", methods=["POST"])
def tryon_flux():
    """
    Replicate Flux Fill Redux Try-On
    Requires:
      person_image: URL
      cloth_image: URL
    """
    data = request.json
    person_url = data.get("person_url")
    cloth_url = data.get("cloth_url")

    if not person_url or not cloth_url:
        return jsonify({"error": "Missing images"}), 400

    print("🧪 Running FLUX try-on via Replicate...")

    try:
        output = replicate.run(
            "cedoysch/flux-fill-redux-try-on:cf5cb07a25e726fe2fac166a8c5ab52ddccd48657741670fb09d9954d4d8446f",
            input={
                "person_image": person_url,
                "cloth_image": cloth_url,
                "output_format": "png",
                "output_quality": 100,
            },
        )

        result_url = output[0] if isinstance(output, list) else output

        img_data = requests.get(result_url).content

        cloud = cloudinary.uploader.upload(
            io.BytesIO(img_data),
            folder="tryiton/flux",
            resource_type="image"
        )

        edited_url = cloud["secure_url"]

        supabase.table("user_edits").insert({
            "source_url": person_url,
            "edited_url": edited_url,
            "prompt": "FLUX_TRYON"
        }).execute()

        return jsonify({
            "status": "success",
            "edited_url": edited_url
        }), 200

    except Exception as e:
        print("\n" + "="*60)
        print("❌ EXCEPTION IN /tryon_flux")
        traceback.print_exc()
        print("="*60 + "\n")

        return jsonify({
            "error": "Replicate model failed",
            "details": str(e)
        }), 500

# Fetches All The Edited Uploads
@app.route("/get_edits", methods=["GET"])
def get_edits():
    """ Return all AI outfit results """
    data = supabase.table("user_edits").select("*").order("id", desc=True).execute()
    return jsonify(data.data), 200

# Generates A 3D Model Using TripoSR
@app.route("/generate_3d", methods=["POST"])
def generate_3d():
    data = request.json
    image_url = data.get("image_url")

    if not image_url:
        return jsonify({"error": "Missing image_url"}), 400

    try:
        print("📥 Downloading image...")
        resp = requests.get(image_url)
        resp.raise_for_status()

        img_id = str(uuid.uuid4())
        tmp_dir = tempfile.gettempdir()

        input_path = os.path.join(tmp_dir, f"{img_id}.png")
        output_dir = os.path.abspath(os.path.join("TripoSR", "output", img_id))
        os.makedirs(output_dir, exist_ok=True)

        with open(input_path, "wb") as f:
            f.write(resp.content)

        print(f"📦 Saved input file: {input_path}")
        print("🚀 Running TripoSR...")

        # -------------------------------------------------
        # ⭐ RUN TRIPOSR (NO unsupported flags)
        # -------------------------------------------------
        TRIPOSR_PYTHON = r"C:\Users\anshu\miniconda3\envs\tryiton39\python.exe"

        result = subprocess.run(
            [
                TRIPOSR_PYTHON,
                "TripoSR/run.py",
                input_path,
                "--output-dir", output_dir,
                "--model-save-format", "obj",
                "--render"
            ],
            capture_output=True,
            text=True
        )

        print("TRIPOSR STDOUT:", result.stdout)
        print("TRIPOSR STDERR:", result.stderr)

        if result.returncode != 0:
            return jsonify({"error": "TripoSR failed", "details": result.stderr}), 500

        obj_path = os.path.abspath(f"{output_dir}/0/mesh.obj")
        render_path = os.path.abspath(f"{output_dir}/0/render_000.png")

        if not os.path.exists(obj_path):
            return jsonify({"error": "3D mesh not generated"}), 500

        # -------------------------------------------------
        # ⭐ Convert OBJ → GLB
        # -------------------------------------------------
        glb_path = os.path.abspath(f"{output_dir}/0/mesh.glb")

        print("🔄 Converting OBJ → GLB...")

        OBJ2GLTF = r"C:\nvm4w\nodejs\obj2gltf.cmd"

        glb_result = subprocess.run(
            [
                OBJ2GLTF,
                "-i", obj_path.replace("\\", "/"),
                "-o", glb_path.replace("\\", "/")
            ],
            capture_output=True,
            text=True
        )

        print("OBJ2GLTF STDOUT:", glb_result.stdout)
        print("OBJ2GLTF STDERR:", glb_result.stderr)

        if glb_result.returncode != 0:
            return jsonify({
                "error": "OBJ→GLB conversion failed",
                "details": glb_result.stderr
            }), 500

        print("✅ Converted to GLB:", glb_path)

        # -------------------------------------------------
        # ⭐ Upload GLB
        # -------------------------------------------------
        cloud_mesh = cloudinary.uploader.upload(
            glb_path,
            folder="tryiton/3d_meshes",
            resource_type="raw"
        )
        mesh_url = cloud_mesh["secure_url"]

        # -------------------------------------------------
        # ⭐ Upload render preview
        # -------------------------------------------------
        render_url = None
        if os.path.exists(render_path):
            cloud_render = cloudinary.uploader.upload(
                render_path,
                folder="tryiton/3d_renders"
            )
            render_url = cloud_render["secure_url"]

        # -------------------------------------------------
        # ⭐ Save record to Supabase
        # -------------------------------------------------
        supabase.table("user_models").insert({
            "image_url": image_url,
            "mesh_url": mesh_url,
            "preview_url": render_url
        }).execute()

        return jsonify({
            "status": "success",
            "mesh_url": mesh_url,
            "render_preview": render_url
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Fetches All The 3D Models Created
@app.route("/get_models", methods=["GET"])
def get_models():
    data = supabase.table("user_models").select("*").order("id", desc=True).execute()
    return jsonify(data.data), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
