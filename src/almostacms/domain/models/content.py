"""Content models for different types of portfolio content."""

from datetime import date as datetime_date
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl, validator

from .base import BaseContent, ContactInfo, MediaFile, SEOData, SocialLink


class PersonalInfo(BaseContent):
    """Personal information and basic details."""

    name: str = Field(..., min_length=1, max_length=100, description="Full name")
    title: str = Field(
        ..., min_length=1, max_length=200, description="Professional title"
    )
    tagline: Optional[str] = Field(
        None, max_length=300, description="Brief tagline or subtitle"
    )
    avatar: Optional[MediaFile] = Field(None, description="Profile picture")
    bio: Optional[str] = Field(None, max_length=1000, description="Personal biography")
    contact_info: ContactInfo = Field(
        default_factory=ContactInfo, description="Contact details"
    )
    social_links: List[SocialLink] = Field(
        default_factory=list, description="Social media links"
    )
    resume_file: Optional[MediaFile] = Field(None, description="Resume/CV file")

    @validator("social_links")
    def validate_social_links(cls, v: List[SocialLink]) -> List[SocialLink]:
        """Limit number of social links."""
        return v[:10]  # Limit to 10 social links


class Service(BaseModel):
    """A service or skill offered."""

    title: str = Field(..., min_length=1, max_length=100, description="Service title")
    description: str = Field(
        ..., min_length=1, max_length=500, description="Service description"
    )
    icon: Optional[str] = Field(None, description="Icon identifier or path")
    featured: bool = Field(default=False, description="Whether to feature this service")


class Testimonial(BaseModel):
    """Client testimonial."""

    name: str = Field(..., min_length=1, max_length=100, description="Client name")
    title: Optional[str] = Field(
        None, max_length=150, description="Client title/company"
    )
    content: str = Field(
        ..., min_length=10, max_length=1000, description="Testimonial text"
    )
    avatar: Optional[MediaFile] = Field(None, description="Client photo")
    date: Optional[datetime_date] = Field(None, description="Testimonial date")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Star rating (1-5)")
    featured: bool = Field(
        default=False, description="Whether to feature this testimonial"
    )


class AboutContent(BaseContent):
    """About section content."""

    title: str = Field(default="About me", max_length=100, description="Section title")
    subtitle: Optional[str] = Field(
        None, max_length=200, description="Section subtitle"
    )
    description: List[str] = Field(..., min_items=1, description="About paragraphs")
    services: List[Service] = Field(
        default_factory=list, description="Services offered"
    )
    testimonials: List[Testimonial] = Field(
        default_factory=list, description="Client testimonials"
    )
    skills: List[str] = Field(default_factory=list, description="Key skills")
    achievements: List[str] = Field(
        default_factory=list, description="Notable achievements"
    )
    intro_video: Optional[MediaFile] = Field(None, description="Introduction video")
    seo: SEOData = Field(default_factory=SEOData, description="SEO metadata")

    @validator("description")
    def validate_description(cls, v: List[str]) -> List[str]:
        """Validate description paragraphs."""
        return [p.strip() for p in v if p.strip()][:5]  # Max 5 paragraphs

    @validator("services")
    def validate_services(cls, v: List[Service]) -> List[Service]:
        """Limit number of services."""
        return v[:12]  # Max 12 services

    @validator("testimonials")
    def validate_testimonials(cls, v: List[Testimonial]) -> List[Testimonial]:
        """Limit number of testimonials."""
        return v[:20]  # Max 20 testimonials


class Experience(BaseModel):
    """Work experience entry."""

    title: str = Field(..., min_length=1, max_length=150, description="Job title")
    company: str = Field(..., min_length=1, max_length=150, description="Company name")
    location: Optional[str] = Field(None, max_length=100, description="Job location")
    start_date: datetime_date = Field(..., description="Start date")
    end_date: Optional[datetime_date] = Field(
        None, description="End date (None for current)"
    )
    description: List[str] = Field(
        default_factory=list, description="Job responsibilities"
    )
    achievements: List[str] = Field(
        default_factory=list, description="Key achievements"
    )
    technologies: List[str] = Field(
        default_factory=list, description="Technologies used"
    )
    company_url: Optional[HttpUrl] = Field(None, description="Company website")

    @validator("end_date")
    def validate_end_date(
        cls, v: Optional[datetime_date], values: Dict
    ) -> Optional[datetime_date]:
        """Validate end date is after start date."""
        if v and "start_date" in values and v <= values["start_date"]:
            raise ValueError("End date must be after start date")
        return v

    @property
    def is_current(self) -> bool:
        """Check if this is current position."""
        return self.end_date is None

    @property
    def duration_text(self) -> str:
        """Get human-readable duration."""
        if self.is_current:
            return f"{self.start_date.strftime('%b %Y')} - Present"
        return (
            f"{self.start_date.strftime('%b %Y')} - {self.end_date.strftime('%b %Y')}"
        )


class Education(BaseModel):
    """Education entry."""

    institution: str = Field(
        ..., min_length=1, max_length=150, description="Institution name"
    )
    degree: str = Field(
        ..., min_length=1, max_length=150, description="Degree/qualification"
    )
    field: Optional[str] = Field(None, max_length=100, description="Field of study")
    location: Optional[str] = Field(None, max_length=100, description="Location")
    start_date: datetime_date = Field(..., description="Start date")
    end_date: Optional[datetime_date] = Field(None, description="End date")
    gpa: Optional[str] = Field(None, max_length=20, description="GPA or grade")
    honors: List[str] = Field(default_factory=list, description="Honors and awards")
    description: Optional[str] = Field(
        None, max_length=500, description="Additional details"
    )

    @property
    def duration_text(self) -> str:
        """Get human-readable duration."""
        if not self.end_date:
            return f"{self.start_date.year} - Present"
        return f"{self.start_date.year} - {self.end_date.year}"


class Skill(BaseModel):
    """Skill with proficiency level."""

    name: str = Field(..., min_length=1, max_length=50, description="Skill name")
    category: Optional[str] = Field(None, max_length=50, description="Skill category")
    level: Optional[int] = Field(
        None, ge=1, le=100, description="Proficiency level (1-100)"
    )
    years_experience: Optional[int] = Field(
        None, ge=0, description="Years of experience"
    )
    featured: bool = Field(default=False, description="Whether to feature this skill")


class ResumeContent(BaseContent):
    """Resume/CV content."""

    title: str = Field(default="Resume", max_length=100, description="Section title")
    subtitle: Optional[str] = Field(
        None, max_length=200, description="Section subtitle"
    )
    summary: Optional[str] = Field(
        None, max_length=1000, description="Professional summary"
    )
    experience: List[Experience] = Field(
        default_factory=list, description="Work experience"
    )
    education: List[Education] = Field(
        default_factory=list, description="Education history"
    )
    skills: List[Skill] = Field(
        default_factory=list, description="Skills and competencies"
    )
    certifications: List[str] = Field(
        default_factory=list, description="Certifications"
    )
    languages: List[Dict[str, str]] = Field(
        default_factory=list, description="Languages spoken"
    )
    interests: List[str] = Field(default_factory=list, description="Personal interests")
    seo: SEOData = Field(default_factory=SEOData, description="SEO metadata")

    @validator("experience")
    def validate_experience(cls, v: List[Experience]) -> List[Experience]:
        """Sort experience by start date (most recent first)."""
        return sorted(v, key=lambda x: x.start_date, reverse=True)

    @validator("education")
    def validate_education(cls, v: List[Education]) -> List[Education]:
        """Sort education by start date (most recent first)."""
        return sorted(v, key=lambda x: x.start_date, reverse=True)


class Project(BaseModel):
    """Portfolio project."""

    title: str = Field(..., min_length=1, max_length=150, description="Project title")
    description: str = Field(
        ..., min_length=10, max_length=1000, description="Project description"
    )
    short_description: Optional[str] = Field(
        None, max_length=200, description="Brief description"
    )
    category: Optional[str] = Field(None, max_length=50, description="Project category")
    tags: List[str] = Field(default_factory=list, description="Project tags")
    technologies: List[str] = Field(
        default_factory=list, description="Technologies used"
    )
    images: List[MediaFile] = Field(default_factory=list, description="Project images")
    featured_image: Optional[MediaFile] = Field(None, description="Main project image")
    project_url: Optional[HttpUrl] = Field(None, description="Live project URL")
    repository_url: Optional[HttpUrl] = Field(None, description="Source code URL")
    date_completed: Optional[datetime_date] = Field(None, description="Completion date")
    client: Optional[str] = Field(None, max_length=100, description="Client name")
    featured: bool = Field(default=False, description="Whether to feature this project")
    status: str = Field(default="completed", description="Project status")

    @validator("status")
    def validate_status(cls, v: str) -> str:
        """Validate project status."""
        allowed_statuses = {"completed", "in_progress", "planned", "on_hold"}
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {allowed_statuses}")
        return v


class PortfolioContent(BaseContent):
    """Portfolio section content."""

    title: str = Field(default="Portfolio", max_length=100, description="Section title")
    subtitle: Optional[str] = Field(
        None, max_length=200, description="Section subtitle"
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Portfolio description"
    )
    projects: List[Project] = Field(
        default_factory=list, description="Portfolio projects"
    )
    categories: List[str] = Field(
        default_factory=list, description="Available categories"
    )
    seo: SEOData = Field(default_factory=SEOData, description="SEO metadata")

    @validator("projects")
    def validate_projects(cls, v: List[Project]) -> List[Project]:
        """Sort projects by completion date (most recent first)."""
        completed_projects = [p for p in v if p.date_completed]
        other_projects = [p for p in v if not p.date_completed]

        completed_projects.sort(key=lambda x: x.date_completed, reverse=True)
        return completed_projects + other_projects


class BlogPost(BaseModel):
    """Blog post entry."""

    title: str = Field(..., min_length=1, max_length=200, description="Post title")
    slug: str = Field(..., min_length=1, max_length=200, description="URL slug")
    excerpt: Optional[str] = Field(None, max_length=300, description="Post excerpt")
    content: str = Field(..., min_length=10, description="Post content")
    featured_image: Optional[MediaFile] = Field(None, description="Featured image")
    tags: List[str] = Field(default_factory=list, description="Post tags")
    category: Optional[str] = Field(None, max_length=50, description="Post category")
    published_date: Optional[datetime_date] = Field(
        None, description="Publication date"
    )
    reading_time: Optional[int] = Field(
        None, ge=1, description="Estimated reading time (minutes)"
    )
    featured: bool = Field(default=False, description="Whether to feature this post")

    @validator("slug")
    def validate_slug(cls, v: str) -> str:
        """Validate and clean URL slug."""
        import re

        slug = re.sub(r"[^\w\-]", "-", v.lower())
        slug = re.sub(r"-+", "-", slug).strip("-")
        return slug[:200]


class BlogContent(BaseContent):
    """Blog section content."""

    title: str = Field(default="Blog", max_length=100, description="Section title")
    subtitle: Optional[str] = Field(
        None, max_length=200, description="Section subtitle"
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Blog description"
    )
    posts: List[BlogPost] = Field(default_factory=list, description="Blog posts")
    categories: List[str] = Field(
        default_factory=list, description="Available categories"
    )
    seo: SEOData = Field(default_factory=SEOData, description="SEO metadata")

    @validator("posts")
    def validate_posts(cls, v: List[BlogPost]) -> List[BlogPost]:
        """Sort posts by publication date (most recent first)."""
        published_posts = [p for p in v if p.published_date]
        unpublished_posts = [p for p in v if not p.published_date]

        published_posts.sort(key=lambda x: x.published_date, reverse=True)
        return published_posts + unpublished_posts


class ContactContent(BaseContent):
    """Contact section content."""

    title: str = Field(default="Contact", max_length=100, description="Section title")
    subtitle: Optional[str] = Field(
        None, max_length=200, description="Section subtitle"
    )
    description: Optional[str] = Field(
        None, max_length=500, description="Contact description"
    )
    contact_info: ContactInfo = Field(
        default_factory=ContactInfo, description="Contact details"
    )
    form_enabled: bool = Field(default=True, description="Whether to show contact form")
    form_email: Optional[str] = Field(
        None, description="Email to receive form submissions"
    )
    show_map: bool = Field(default=False, description="Whether to show location map")
    map_coordinates: Optional[Dict[str, float]] = Field(
        None, description="Map coordinates"
    )
    office_hours: Optional[str] = Field(
        None, max_length=200, description="Office hours"
    )
    seo: SEOData = Field(default_factory=SEOData, description="SEO metadata")


class MenuItem(BaseModel):
    """Navigation menu item."""

    label: str = Field(..., min_length=1, max_length=50, description="Menu item label")
    href: str = Field(..., min_length=1, max_length=100, description="Link target")
    icon: Optional[str] = Field(None, max_length=50, description="Icon identifier")
    order: int = Field(default=0, description="Display order")
    external: bool = Field(default=False, description="Whether link is external")
    active: bool = Field(default=True, description="Whether menu item is active")


class NavigationContent(BaseContent):
    """Navigation configuration."""

    site_title: str = Field(..., min_length=1, max_length=100, description="Site title")
    logo: Optional[MediaFile] = Field(None, description="Site logo")
    menu_items: List[MenuItem] = Field(default_factory=list, description="Menu items")
    show_search: bool = Field(default=False, description="Whether to show search")
    sticky_navigation: bool = Field(
        default=True, description="Whether navigation is sticky"
    )

    @validator("menu_items")
    def validate_menu_items(cls, v: List[MenuItem]) -> List[MenuItem]:
        """Sort menu items by order."""
        return sorted(v, key=lambda x: x.order)
