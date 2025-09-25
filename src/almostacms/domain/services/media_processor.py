"""Media processing service for image optimization and manipulation."""

import hashlib
import io
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from PIL import Image, ImageOps
from PIL.ExifTags import TAGS

from almostacms.infrastructure.logging.logger import get_logger
from config import get_settings

logger = get_logger(__name__)
settings = get_settings()


class MediaFile:
    """Represents a processed media file with metadata."""

    def __init__(
        self,
        filename: str,
        original_filename: str,
        file_path: Path,
        file_size: int,
        mime_type: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.filename = filename
        self.original_filename = original_filename
        self.file_path = file_path
        self.file_size = file_size
        self.mime_type = mime_type
        self.width = width
        self.height = height
        self.metadata = metadata or {}
        self.upload_date = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert media file info to dictionary."""
        return {
            "filename": self.filename,
            "original_filename": self.original_filename,
            "file_path": str(self.file_path),
            "url": f"/media/{self.filename}",
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "width": self.width,
            "height": self.height,
            "metadata": self.metadata,
            "upload_date": self.upload_date.isoformat(),
        }


class MediaProcessor:
    """Service for processing and managing media files."""

    # Supported image formats
    SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"}

    # Image size presets
    SIZES = {
        "thumbnail": (150, 150),
        "small": (300, 300),
        "medium": (600, 600),
        "large": (1200, 1200),
    }

    # Maximum file size (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024

    def __init__(self):
        """Initialize media processor."""
        self.media_dir = settings.media_dir
        self.media_dir.mkdir(parents=True, exist_ok=True)

        # Create subdirectories for different sizes
        for size_name in self.SIZES:
            (self.media_dir / size_name).mkdir(exist_ok=True)

    def validate_file(self, filename: str, content: bytes) -> Tuple[bool, str]:
        """
        Validate uploaded file.

        Args:
            filename: Original filename
            content: File content bytes

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        if len(content) > self.MAX_FILE_SIZE:
            return (
                False,
                f"File too large. Maximum size is {self.MAX_FILE_SIZE // (1024*1024)}MB",
            )

        # Check file extension
        file_ext = Path(filename).suffix.lower()
        if file_ext not in self.SUPPORTED_FORMATS:
            return (
                False,
                f"Unsupported file format. Supported: {', '.join(self.SUPPORTED_FORMATS)}",
            )

        # Try to open as image to validate
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
            return True, ""
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"

    def generate_filename(self, original_filename: str, content: bytes) -> str:
        """
        Generate unique filename based on content hash.

        Args:
            original_filename: Original filename
            content: File content bytes

        Returns:
            Generated unique filename
        """
        # Create hash of file content
        content_hash = hashlib.md5(content).hexdigest()[:8]

        # Get file extension
        file_ext = Path(original_filename).suffix.lower()

        # Create filename with timestamp and hash
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{content_hash}{file_ext}"

    def extract_image_metadata(self, image: Image.Image) -> Dict[str, Any]:
        """
        Extract metadata from image.

        Args:
            image: PIL Image object

        Returns:
            Dictionary of metadata
        """
        metadata = {
            "format": image.format,
            "mode": image.mode,
            "size": image.size,
            "has_transparency": "transparency" in image.info,
        }

        # Extract EXIF data if available
        if hasattr(image, "_getexif") and image._getexif() is not None:
            exif_data = {}
            for tag_id, value in image._getexif().items():
                tag = TAGS.get(tag_id, tag_id)
                exif_data[tag] = value
            metadata["exif"] = exif_data

        return metadata

    def resize_image(
        self, image: Image.Image, size: Tuple[int, int], quality: int = 85
    ) -> Image.Image:
        """
        Resize image to specified dimensions while maintaining aspect ratio.

        Args:
            image: PIL Image object
            size: Target size (width, height)
            quality: JPEG quality (1-100)

        Returns:
            Resized PIL Image object
        """
        # Use ImageOps.fit to resize and crop to exact dimensions
        resized = ImageOps.fit(
            image, size, Image.Resampling.LANCZOS, centering=(0.5, 0.5)
        )

        return resized

    def optimize_image(self, image: Image.Image, format: str = "WEBP") -> Image.Image:
        """
        Optimize image for web delivery.

        Args:
            image: PIL Image object
            format: Target format (WEBP, JPEG, PNG)

        Returns:
            Optimized PIL Image object
        """
        # Convert to RGB if necessary (for WEBP/JPEG)
        if format in ("WEBP", "JPEG") and image.mode in ("RGBA", "P"):
            # Create white background for transparent images
            background = Image.new("RGB", image.size, (255, 255, 255))
            if image.mode == "P":
                image = image.convert("RGBA")
            background.paste(
                image, mask=image.split()[-1] if image.mode == "RGBA" else None
            )
            image = background

        return image

    def process_image(self, content: bytes, original_filename: str) -> MediaFile:
        """
        Process uploaded image file.

        Args:
            content: File content bytes
            original_filename: Original filename

        Returns:
            MediaFile object with processing results

        Raises:
            ValueError: If file validation fails
            Exception: If processing fails
        """
        logger.info(f"Processing image: {original_filename}")

        # Validate file
        is_valid, error_message = self.validate_file(original_filename, content)
        if not is_valid:
            raise ValueError(error_message)

        # Generate unique filename
        filename = self.generate_filename(original_filename, content)

        # Open image
        image = Image.open(io.BytesIO(content))

        # Extract metadata
        metadata = self.extract_image_metadata(image)

        # Get image dimensions
        width, height = image.size

        # Save original image
        original_path = self.media_dir / filename

        # Optimize and save original
        optimized_image = self.optimize_image(image.copy())
        optimized_image.save(original_path, format="WEBP", quality=85, optimize=True)

        # Generate different sizes
        for size_name, dimensions in self.SIZES.items():
            size_dir = self.media_dir / size_name
            size_filename = f"{Path(filename).stem}_{size_name}.webp"
            size_path = size_dir / size_filename

            # Resize and save
            resized_image = self.resize_image(image.copy(), dimensions)
            optimized_resized = self.optimize_image(resized_image)
            optimized_resized.save(size_path, format="WEBP", quality=85, optimize=True)

        # Get file size of optimized image
        file_size = original_path.stat().st_size

        # Create MediaFile object
        media_file = MediaFile(
            filename=filename,
            original_filename=original_filename,
            file_path=original_path,
            file_size=file_size,
            mime_type="image/webp",
            width=width,
            height=height,
            metadata=metadata,
        )

        logger.info(f"Successfully processed image: {filename}")
        return media_file

    def delete_media_file(self, filename: str) -> bool:
        """
        Delete media file and all its variants.

        Args:
            filename: Filename to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # Delete original file
            original_path = self.media_dir / filename
            if original_path.exists():
                original_path.unlink()

            # Delete size variants
            base_name = Path(filename).stem
            for size_name in self.SIZES:
                size_dir = self.media_dir / size_name
                size_filename = f"{base_name}_{size_name}.webp"
                size_path = size_dir / size_filename
                if size_path.exists():
                    size_path.unlink()

            logger.info(f"Deleted media file: {filename}")
            return True

        except Exception as e:
            logger.error(f"Error deleting media file {filename}: {str(e)}")
            return False

    def list_media_files(self) -> List[Dict[str, Any]]:
        """
        List all media files.

        Returns:
            List of media file information dictionaries
        """
        media_files = []

        for file_path in self.media_dir.glob("*"):
            if (
                file_path.is_file()
                and file_path.suffix.lower() in self.SUPPORTED_FORMATS
            ):
                try:
                    # Get file info
                    stat = file_path.stat()

                    # Try to get image dimensions
                    width, height = None, None
                    try:
                        with Image.open(file_path) as image:
                            width, height = image.size
                    except Exception:
                        pass

                    media_info = {
                        "filename": file_path.name,
                        "original_filename": file_path.name,  # Could store original name in metadata
                        "file_path": str(file_path),
                        "url": f"/media/{file_path.name}",
                        "file_size": stat.st_size,
                        "mime_type": self._get_mime_type(file_path.suffix),
                        "width": width,
                        "height": height,
                        "upload_date": datetime.fromtimestamp(
                            stat.st_mtime
                        ).isoformat(),
                        "metadata": {},
                    }

                    media_files.append(media_info)

                except Exception as e:
                    logger.error(f"Error reading media file {file_path}: {str(e)}")

        # Sort by upload date (newest first)
        media_files.sort(key=lambda x: x["upload_date"], reverse=True)
        return media_files

    def _get_mime_type(self, extension: str) -> str:
        """Get mime type from file extension."""
        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
        }
        return mime_types.get(extension.lower(), "application/octet-stream")

    def get_media_url(self, filename: str, size: Optional[str] = None) -> str:
        """
        Get URL for media file.

        Args:
            filename: Media filename
            size: Size variant (thumbnail, small, medium, large)

        Returns:
            URL to media file
        """
        if size and size in self.SIZES:
            base_name = Path(filename).stem
            return f"/media/{size}/{base_name}_{size}.webp"

        return f"/media/{filename}"
