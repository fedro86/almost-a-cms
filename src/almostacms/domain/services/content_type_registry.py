"""Dynamic content type registry and loading system."""

import importlib
import inspect
from typing import Dict, List, Optional, Type, get_type_hints

from ...infrastructure.logging import get_logger
from ..models.base import BaseContent
from ..models.content import (
    AboutContent,
    BlogContent,
    ContactContent,
    NavigationContent,
    PersonalInfo,
    PortfolioContent,
    ResumeContent,
)

logger = get_logger(__name__)


class ContentTypeRegistry:
    """Registry for dynamic content type discovery and management."""

    def __init__(self):
        """Initialize the content type registry."""
        self._content_types: Dict[str, Type[BaseContent]] = {}
        self._schemas: Dict[str, dict] = {}
        self._initialized = False

    def initialize(self) -> None:
        """Initialize the registry with built-in content types."""
        if self._initialized:
            return

        # Register built-in content types
        built_in_types = [
            PersonalInfo,
            AboutContent,
            ResumeContent,
            PortfolioContent,
            BlogContent,
            ContactContent,
            NavigationContent,
        ]

        for content_class in built_in_types:
            self.register_content_type(content_class)

        # Auto-discover custom content types
        self._discover_custom_types()

        self._initialized = True
        logger.info(
            "Content type registry initialized",
            extra={"registered_types": len(self._content_types)},
        )

    def register_content_type(self, content_class: Type[BaseContent]) -> bool:
        """Register a content type class.

        Args:
            content_class: Content class that inherits from BaseContent

        Returns:
            True if registration was successful
        """
        try:
            # Validate that class inherits from BaseContent
            if not issubclass(content_class, BaseContent):
                logger.error(
                    f"Content class {content_class.__name__} does not inherit from BaseContent"
                )
                return False

            # Get content type identifier
            content_type = content_class._class_name_to_content_type(
                content_class.__name__
            )

            # Generate JSON schema
            schema = content_class.schema()

            # Register the type
            self._content_types[content_type] = content_class
            self._schemas[content_type] = schema

            logger.debug(
                f"Registered content type: {content_type}",
                extra={
                    "content_type": content_type,
                    "class_name": content_class.__name__,
                    "schema_fields": len(schema.get("properties", {})),
                },
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to register content type {content_class.__name__}: {e}"
            )
            return False

    def _discover_custom_types(self) -> None:
        """Discover custom content types from plugins/extensions."""
        try:
            # Look for custom content types in extensions directory
            extensions_path = "src.almostacms.extensions"

            try:
                extensions_module = importlib.import_module(extensions_path)
                self._scan_module_for_content_types(extensions_module)
            except ImportError:
                logger.debug("No extensions module found for custom content types")

            # Look for content types in user-defined modules
            # This could be extended to support plugin directories

        except Exception as e:
            logger.error(f"Error during custom content type discovery: {e}")

    def _scan_module_for_content_types(self, module) -> None:
        """Scan a module for BaseContent subclasses.

        Args:
            module: Python module to scan
        """
        try:
            for name, obj in inspect.getmembers(module):
                if (
                    inspect.isclass(obj)
                    and issubclass(obj, BaseContent)
                    and obj != BaseContent
                ):
                    self.register_content_type(obj)
                    logger.info(f"Discovered custom content type: {obj.__name__}")

        except Exception as e:
            logger.error(f"Error scanning module {module.__name__}: {e}")

    def get_content_type_class(self, content_type: str) -> Optional[Type[BaseContent]]:
        """Get content type class by identifier.

        Args:
            content_type: Content type identifier

        Returns:
            Content class if found, None otherwise
        """
        if not self._initialized:
            self.initialize()

        return self._content_types.get(content_type)

    def get_content_schema(self, content_type: str) -> Optional[dict]:
        """Get JSON schema for content type.

        Args:
            content_type: Content type identifier

        Returns:
            JSON schema if found, None otherwise
        """
        if not self._initialized:
            self.initialize()

        return self._schemas.get(content_type)

    def list_content_types(self) -> List[str]:
        """Get list of registered content type identifiers.

        Returns:
            List of content type identifiers
        """
        if not self._initialized:
            self.initialize()

        return list(self._content_types.keys())

    def get_content_type_info(self, content_type: str) -> Optional[dict]:
        """Get detailed information about a content type.

        Args:
            content_type: Content type identifier

        Returns:
            Content type information dictionary
        """
        if not self._initialized:
            self.initialize()

        content_class = self._content_types.get(content_type)
        if not content_class:
            return None

        schema = self._schemas.get(content_type, {})

        return {
            "content_type": content_type,
            "class_name": content_class.__name__,
            "module": content_class.__module__,
            "description": content_class.__doc__ or "",
            "schema": schema,
            "field_count": len(schema.get("properties", {})),
            "required_fields": schema.get("required", []),
            "default_values": self._extract_default_values(content_class),
        }

    def _extract_default_values(self, content_class: Type[BaseContent]) -> dict:
        """Extract default values from a content class.

        Args:
            content_class: Content class

        Returns:
            Dictionary of field defaults
        """
        try:
            defaults = {}

            # Get field defaults from Pydantic model
            for field_name, field_info in content_class.__fields__.items():
                if (
                    field_info.default is not ...
                ):  # ... is Pydantic's sentinel for required
                    if callable(field_info.default):
                        # Handle default_factory
                        try:
                            defaults[field_name] = field_info.default()
                        except Exception:
                            defaults[field_name] = None
                    else:
                        defaults[field_name] = field_info.default

            return defaults

        except Exception as e:
            logger.error(f"Error extracting defaults for {content_class.__name__}: {e}")
            return {}

    def create_content_instance(
        self, content_type: str, data: dict, validate: bool = True
    ) -> Optional[BaseContent]:
        """Create and validate a content instance.

        Args:
            content_type: Content type identifier
            data: Content data
            validate: Whether to validate the data

        Returns:
            Content instance if successful, None otherwise
        """
        try:
            content_class = self.get_content_type_class(content_type)
            if not content_class:
                logger.error(f"Unknown content type: {content_type}")
                return None

            if validate:
                # Create instance with validation
                instance = content_class(**data)
            else:
                # Create instance without validation (use parse_obj_as for raw data)
                instance = content_class.parse_obj(data)

            logger.debug(
                f"Created content instance for {content_type}",
                extra={"content_type": content_type, "validated": validate},
            )
            return instance

        except Exception as e:
            logger.error(
                f"Failed to create content instance for {content_type}: {e}",
                extra={"content_type": content_type, "error": str(e)},
            )
            return None

    def validate_content_data(
        self, content_type: str, data: dict
    ) -> tuple[bool, List[str]]:
        """Validate content data against schema.

        Args:
            content_type: Content type identifier
            data: Content data to validate

        Returns:
            Tuple of (is_valid, error_messages)
        """
        try:
            content_class = self.get_content_type_class(content_type)
            if not content_class:
                return False, [f"Unknown content type: {content_type}"]

            # Attempt to create instance for validation
            instance = content_class(**data)
            return True, []

        except Exception as e:
            error_messages = []

            # Extract validation errors if it's a Pydantic ValidationError
            if hasattr(e, "errors"):
                for error in e.errors():
                    field = " -> ".join(str(loc) for loc in error["loc"])
                    message = error["msg"]
                    error_messages.append(f"{field}: {message}")
            else:
                error_messages.append(str(e))

            return False, error_messages

    def get_registry_status(self) -> dict:
        """Get current registry status.

        Returns:
            Registry status information
        """
        return {
            "initialized": self._initialized,
            "total_types": len(self._content_types),
            "registered_types": list(self._content_types.keys()),
            "schema_count": len(self._schemas),
        }


# Global registry instance
content_type_registry = ContentTypeRegistry()
