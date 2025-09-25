"""Form schema generator service for converting Pydantic models to form schemas."""

import inspect
from datetime import date as datetime_date
from typing import Any, Dict, List, Optional, Type, Union, get_args, get_origin

from pydantic import BaseModel, Field
from pydantic.fields import FieldInfo

from ..models.base import BaseContent


class FormFieldSchema:
    """Schema for a single form field."""

    def __init__(
        self,
        name: str,
        field_type: str,
        widget_type: str,
        label: str,
        required: bool = False,
        default: Any = None,
        description: Optional[str] = None,
        placeholder: Optional[str] = None,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None,
        min_value: Optional[Union[int, float]] = None,
        max_value: Optional[Union[int, float]] = None,
        options: Optional[List[Dict[str, Any]]] = None,
        nested_schema: Optional[Dict[str, Any]] = None,
        is_array: bool = False,
        array_item_schema: Optional[Dict[str, Any]] = None,
    ):
        """Initialize form field schema."""
        self.name = name
        self.field_type = field_type
        self.widget_type = widget_type
        self.label = label
        self.required = required
        self.default = default
        self.description = description
        self.placeholder = placeholder
        self.min_length = min_length
        self.max_length = max_length
        self.min_value = min_value
        self.max_value = max_value
        self.options = options or []
        self.nested_schema = nested_schema
        self.is_array = is_array
        self.array_item_schema = array_item_schema

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API serialization."""
        return {
            "name": self.name,
            "field_type": self.field_type,
            "widget_type": self.widget_type,
            "label": self.label,
            "required": self.required,
            "default": self.default,
            "description": self.description,
            "placeholder": self.placeholder,
            "min_length": self.min_length,
            "max_length": self.max_length,
            "min_value": self.min_value,
            "max_value": self.max_value,
            "options": self.options,
            "nested_schema": self.nested_schema,
            "is_array": self.is_array,
            "array_item_schema": self.array_item_schema,
        }


class FormSchemaGenerator:
    """Generates form schemas from Pydantic models."""

    # Mapping of Python types to form field types
    TYPE_MAPPING = {
        str: "string",
        int: "integer",
        float: "number",
        bool: "boolean",
        datetime_date: "date",
    }

    # Mapping of field types to widget types
    WIDGET_MAPPING = {
        "string": "input",
        "integer": "number",
        "number": "number",
        "boolean": "checkbox",
        "date": "date",
        "email": "email",
        "url": "url",
        "text": "textarea",
        "password": "password",
    }

    def __init__(self):
        """Initialize the form schema generator."""
        pass

    def generate_form_schema(self, model_class: Type[BaseModel]) -> Dict[str, Any]:
        """Generate a complete form schema from a Pydantic model."""
        fields = []
        field_groups = {}

        # Get model fields
        model_fields = (
            model_class.__fields__ if hasattr(model_class, "__fields__") else {}
        )

        for field_name, field_info in model_fields.items():
            field_schema = self._generate_field_schema(
                field_name, field_info, model_class
            )
            if field_schema:
                fields.append(field_schema)

                # Group fields by logical sections
                group = self._determine_field_group(field_name, field_schema)
                if group not in field_groups:
                    field_groups[group] = []
                field_groups[group].append(field_schema)

        return {
            "model_name": model_class.__name__,
            "title": self._generate_form_title(model_class),
            "description": model_class.__doc__ or "",
            "fields": [field.to_dict() for field in fields],
            "field_groups": {
                group: [field.to_dict() for field in group_fields]
                for group, group_fields in field_groups.items()
            },
            "validation_rules": self._extract_validation_rules(model_class),
        }

    def _generate_field_schema(
        self, field_name: str, field_info: FieldInfo, model_class: Type[BaseModel]
    ) -> Optional[FormFieldSchema]:
        """Generate schema for a single field."""
        try:
            # Get field type information
            field_type = field_info.annotation
            origin_type = get_origin(field_type)
            type_args = get_args(field_type)

            # Handle Optional types (Union[Type, None])
            is_optional = False
            if origin_type is Union:
                # Filter out None type
                non_none_types = [arg for arg in type_args if arg is not type(None)]
                if len(non_none_types) == 1:
                    field_type = non_none_types[0]
                    is_optional = True
                    origin_type = get_origin(field_type)
                    type_args = get_args(field_type)

            # Handle List types
            is_array = False
            array_item_type = None
            if origin_type is list:
                is_array = True
                array_item_type = type_args[0] if type_args else str
                field_type = array_item_type

            # Determine base field type
            base_field_type = self._get_base_field_type(field_type)

            # Determine widget type based on field name and type
            widget_type = self._determine_widget_type(
                field_name, base_field_type, field_info
            )

            # Generate field schema
            schema = FormFieldSchema(
                name=field_name,
                field_type=base_field_type,
                widget_type=widget_type,
                label=self._generate_field_label(field_name),
                required=not is_optional and field_info.default == ...,
                default=self._get_field_default(field_info, is_array),
                description=field_info.description,
                placeholder=self._generate_placeholder(field_name, base_field_type),
                is_array=is_array,
            )

            # Extract validation constraints
            self._add_validation_constraints(schema, field_info)

            # Handle nested models
            if inspect.isclass(field_type) and issubclass(field_type, BaseModel):
                schema.nested_schema = self.generate_form_schema(field_type)
                schema.widget_type = "nested_object"

            # Handle array of nested models
            if (
                is_array
                and inspect.isclass(array_item_type)
                and issubclass(array_item_type, BaseModel)
            ):
                schema.array_item_schema = self.generate_form_schema(array_item_type)
                schema.widget_type = "nested_array"

            return schema

        except Exception as e:
            # Log error and return None to skip problematic fields
            print(f"Warning: Could not generate schema for field {field_name}: {e}")
            return None

    def _get_base_field_type(self, field_type: Type) -> str:
        """Get the base field type string."""
        if field_type in self.TYPE_MAPPING:
            return self.TYPE_MAPPING[field_type]

        # Handle special cases
        if hasattr(field_type, "__name__"):
            type_name = field_type.__name__.lower()
            if "url" in type_name:
                return "url"
            elif "email" in type_name:
                return "email"
            elif "mediafile" in type_name:
                return "file"
            elif inspect.isclass(field_type) and issubclass(field_type, BaseModel):
                return "object"

        return "string"

    def _determine_widget_type(
        self, field_name: str, field_type: str, field_info: FieldInfo
    ) -> str:
        """Determine the appropriate widget type for a field."""
        field_name_lower = field_name.lower()

        # Special field name patterns
        if "password" in field_name_lower:
            return "password"
        elif "email" in field_name_lower:
            return "email"
        elif "url" in field_name_lower or "link" in field_name_lower:
            return "url"
        elif any(
            word in field_name_lower
            for word in ["bio", "description", "summary", "content"]
        ):
            return "textarea"
        elif (
            "file" in field_name_lower
            or "avatar" in field_name_lower
            or "image" in field_name_lower
        ):
            return "file"

        # Check max_length for textarea detection
        if (
            field_type == "string"
            and hasattr(field_info, "max_length")
            and field_info.max_length
            and field_info.max_length > 100
        ):
            return "textarea"

        # Use type-based mapping
        return self.WIDGET_MAPPING.get(field_type, "input")

    def _generate_field_label(self, field_name: str) -> str:
        """Generate a human-readable label from field name."""
        # Convert snake_case to Title Case
        return field_name.replace("_", " ").title()

    def _generate_placeholder(self, field_name: str, field_type: str) -> str:
        """Generate placeholder text for a field."""
        field_name_lower = field_name.lower()

        placeholders = {
            "name": "Enter your full name",
            "title": "Enter your professional title",
            "tagline": "Enter a brief tagline or motto",
            "bio": "Tell us about yourself...",
            "description": "Enter description...",
            "summary": "Enter summary...",
            "email": "Enter email address",
            "url": "https://example.com",
            "website": "https://yourwebsite.com",
            "company": "Enter company name",
            "location": "Enter location",
            "phone": "Enter phone number",
        }

        # Try exact field name match first
        for key, placeholder in placeholders.items():
            if key in field_name_lower:
                return placeholder

        # Fallback based on field type
        if field_type == "email":
            return "Enter email address"
        elif field_type == "url":
            return "https://example.com"
        elif field_type == "date":
            return "YYYY-MM-DD"
        elif field_type == "number" or field_type == "integer":
            return "Enter number"

        return f"Enter {field_name.replace('_', ' ').lower()}"

    def _get_field_default(self, field_info: FieldInfo, is_array: bool = False) -> Any:
        """Get the default value for a field."""
        if field_info.default is not ...:
            if callable(field_info.default):
                # Handle default_factory
                try:
                    return field_info.default()
                except:
                    return [] if is_array else ""
            return field_info.default
        return [] if is_array else ""

    def _add_validation_constraints(
        self, schema: FormFieldSchema, field_info: FieldInfo
    ):
        """Add validation constraints from Pydantic field info."""
        # Extract constraints from field_info
        if hasattr(field_info, "min_length") and field_info.min_length is not None:
            schema.min_length = field_info.min_length
        if hasattr(field_info, "max_length") and field_info.max_length is not None:
            schema.max_length = field_info.max_length
        if hasattr(field_info, "ge") and field_info.ge is not None:
            schema.min_value = field_info.ge
        if hasattr(field_info, "le") and field_info.le is not None:
            schema.max_value = field_info.le
        if hasattr(field_info, "gt") and field_info.gt is not None:
            schema.min_value = field_info.gt + (
                1 if isinstance(field_info.gt, int) else 0.01
            )
        if hasattr(field_info, "lt") and field_info.lt is not None:
            schema.max_value = field_info.lt - (
                1 if isinstance(field_info.lt, int) else 0.01
            )

    def _determine_field_group(
        self, field_name: str, field_schema: FormFieldSchema
    ) -> str:
        """Determine which group a field belongs to."""
        field_name_lower = field_name.lower()

        # Basic information group
        if any(
            word in field_name_lower
            for word in ["name", "title", "tagline", "bio", "avatar"]
        ):
            return "basic"

        # Contact information group
        if any(
            word in field_name_lower
            for word in ["email", "phone", "address", "contact", "social"]
        ):
            return "contact"

        # SEO group
        if any(
            word in field_name_lower for word in ["seo", "meta", "keywords", "robots"]
        ):
            return "seo"

        # Media group
        if any(
            word in field_name_lower
            for word in ["image", "file", "media", "avatar", "video"]
        ):
            return "media"

        # Advanced group for complex fields
        if field_schema.is_array or field_schema.nested_schema:
            return "advanced"

        return "general"

    def _generate_form_title(self, model_class: Type[BaseModel]) -> str:
        """Generate a title for the form."""
        class_name = model_class.__name__

        # Convert class names to readable titles
        titles = {
            "PersonalInfo": "Personal Information",
            "AboutContent": "About Section",
            "ResumeContent": "Resume & Experience",
            "PortfolioContent": "Portfolio Projects",
            "BlogContent": "Blog Posts",
            "ContactContent": "Contact Information",
            "NavigationContent": "Navigation Menu",
        }

        return titles.get(class_name, class_name.replace("Content", ""))

    def _extract_validation_rules(self, model_class: Type[BaseModel]) -> Dict[str, Any]:
        """Extract validation rules from the model."""
        rules = {
            "required_fields": [],
            "field_constraints": {},
            "custom_validators": [],
        }

        # Get required fields
        if hasattr(model_class, "__fields__"):
            for field_name, field_info in model_class.__fields__.items():
                if field_info.default == ... and not self._is_optional_type(
                    field_info.annotation
                ):
                    rules["required_fields"].append(field_name)

        return rules

    def _is_optional_type(self, type_annotation: Type) -> bool:
        """Check if a type annotation represents an Optional type."""
        origin = get_origin(type_annotation)
        if origin is Union:
            args = get_args(type_annotation)
            return type(None) in args
        return False


# Global instance
form_schema_generator = FormSchemaGenerator()
