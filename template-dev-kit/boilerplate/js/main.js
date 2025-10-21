/**
 * Main JavaScript for AlmostaCMS Template
 *
 * This file demonstrates how to use the AlmostaCMSDataLoader
 * to populate your template with data from JSON files.
 */

// Initialize the data loader
const dataLoader = new AlmostaCMSDataLoader({
  basePath: '',      // Root of your site
  dataPath: 'data/'  // Path to data directory
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load all data files
    const [about, projects, blog, contact, navbar, settings] = await dataLoader.loadAll(
      'about',
      'projects',
      'blog',
      'contact',
      'navbar',
      'settings'
    );

    // Auto-populate elements with data-json-* attributes
    dataLoader.autoPopulate({
      about,
      projects,
      blog,
      contact,
      navbar,
      settings
    });

    // Custom population for complex structures
    populateNavbar(navbar);
    populateSkills(about.skills);
    populateInterests(about.interests);
    populateSocialLinks(about.social);
    populateProjects(projects.projects);
    populateBlog(blog.posts);
    populateContactSocial(contact.social);
    populateFooterSocial(about.social);

    // Initialize mobile menu
    initMobileMenu();

  } catch (error) {
    console.error('Error loading data:', error);
    // You might want to show an error message to the user
  }
});

/**
 * Populate navigation menu
 */
function populateNavbar(navbar) {
  const navbarMenu = document.getElementById('navbar-menu');
  if (!navbarMenu || !navbar.items) return;

  navbarMenu.innerHTML = navbar.items.map(item => `
    <li>
      <a href="${item.url}" ${item.active ? 'class="active"' : ''}>
        ${item.label}
      </a>
    </li>
  `).join('');
}

/**
 * Populate skills list
 */
function populateSkills(skills) {
  const skillsList = document.getElementById('skills-list');
  if (!skillsList || !skills) return;

  skillsList.innerHTML = skills.map(skill => `
    <li>${skill}</li>
  `).join('');
}

/**
 * Populate interests list
 */
function populateInterests(interests) {
  const interestsList = document.getElementById('interests-list');
  if (!interestsList || !interests) return;

  interestsList.innerHTML = interests.map(interest => `
    <li>${interest}</li>
  `).join('');
}

/**
 * Populate social links
 */
function populateSocialLinks(social) {
  const socialLinks = document.getElementById('social-links');
  if (!socialLinks || !social) return;

  const links = Object.entries(social).map(([platform, url]) => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${platformName}</a>`;
  }).join('');

  socialLinks.innerHTML = links;
}

/**
 * Populate projects grid
 */
function populateProjects(projects) {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid || !projects) return;

  // Show only featured projects or all if none are featured
  const displayProjects = projects.filter(p => p.featured).length > 0
    ? projects.filter(p => p.featured)
    : projects.slice(0, 3);

  projectsGrid.innerHTML = displayProjects.map(project => `
    <div class="project-card">
      ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
      <div class="project-card-content">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-tags">
          ${project.tags ? project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('') : ''}
        </div>
        <div class="project-links">
          ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer">View Code</a>` : ''}
          ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Populate blog grid
 */
function populateBlog(posts) {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid || !posts) return;

  // Show only featured posts or first 3
  const displayPosts = posts.filter(p => p.featured).length > 0
    ? posts.filter(p => p.featured)
    : posts.slice(0, 3);

  blogGrid.innerHTML = displayPosts.map(post => `
    <article class="blog-card">
      ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
      <div class="blog-card-content">
        <h3>${post.title}</h3>
        <div class="blog-card-meta">
          ${post.date ? `<span>${formatDate(post.date)}</span>` : ''}
          ${post.readTime ? `<span> • ${post.readTime}</span>` : ''}
        </div>
        <p>${post.excerpt}</p>
        ${post.tags ? `
          <div class="blog-card-tags">
            ${post.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </article>
  `).join('');
}

/**
 * Populate contact social links
 */
function populateContactSocial(social) {
  const contactSocial = document.getElementById('contact-social');
  if (!contactSocial || !social) return;

  const links = Object.entries(social).map(([platform, data]) => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const url = typeof data === 'string' ? data : data.url;
    const handle = typeof data === 'object' ? data.handle : url;

    return `
      <div class="contact-item">
        <h3>${platformName}</h3>
        <p><a href="${url}" target="_blank" rel="noopener noreferrer">${handle}</a></p>
      </div>
    `;
  }).join('');

  contactSocial.innerHTML = links;
}

/**
 * Populate footer social links
 */
function populateFooterSocial(social) {
  const footerSocial = document.getElementById('footer-social');
  if (!footerSocial || !social) return;

  const links = Object.entries(social).map(([platform, url]) => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${platformName}">${platformName}</a>`;
  }).join('');

  footerSocial.innerHTML = links;
}

/**
 * Populate contact location
 */
function populateContactLocation(location) {
  const contactLocation = document.getElementById('contact-location');
  if (!contactLocation || !location) return;

  const locationText = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ');

  contactLocation.textContent = locationText;
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.getElementById('navbar-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    const isExpanded = menu.classList.contains('active');
    toggle.setAttribute('aria-expanded', isExpanded);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Format date string
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}
