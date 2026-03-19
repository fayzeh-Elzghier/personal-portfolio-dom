const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ILLEGAL_EMAIL_REGEX = /[^a-zA-Z0-9@._-]/;
const ILLEGAL_MESSAGE_REGEX = /[^a-zA-Z0-9@._\-\s]/;
const MAX_MESSAGE_LENGTH = 300;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  try {
    const [aboutMeData, projectsData] = await Promise.all([
      fetchJson('./data/aboutMeData.json'),
      fetchJson('./data/projectsData.json')
    ]);

    renderAboutMe(aboutMeData);
    renderProjects(projectsData);
    setupProjectNavigation();
    setupFormValidation();
    updateHeaderName();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${path}`);
  }

  return response.json();
}

function renderAboutMe(data) {
  const aboutMeContainer = document.getElementById('aboutMe');
  if (!aboutMeContainer) return;

  const bio = document.createElement('p');
  bio.textContent = data.aboutMe || 'No bio available.';

  const headshotContainer = document.createElement('div');
  headshotContainer.className = 'headshotContainer';

  const image = document.createElement('img');
  image.src = normalizeImagePath(
    data.headshot,
    './images/card_placeholder_bg.webp'
  );
  image.alt = 'Headshot image';
  image.onerror = () => {
    image.src = './images/card_placeholder_bg.webp';
  };

  headshotContainer.appendChild(image);
  aboutMeContainer.appendChild(bio);
  aboutMeContainer.appendChild(headshotContainer);
}

function renderProjects(projects) {
  const projectList = document.getElementById('projectList');
  if (!projectList || !Array.isArray(projects) || projects.length === 0) return;

  const fragment = document.createDocumentFragment();

  projects.forEach((project) => {
    const card = createProjectCard(project);
    fragment.appendChild(card);
  });

  projectList.appendChild(fragment);
  updateProjectSpotlight(projects[0]);
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'projectCard';
  card.id = project.project_id || 'project-card';

  const title = document.createElement('h4');
  title.textContent = project.project_name || 'Untitled Project';

  const description = document.createElement('p');
  description.textContent =
    project.short_description || 'No short description available.';

  const cardImage = normalizeImagePath(
    project.card_image,
    './images/card_placeholder_bg.webp'
  );

  card.style.backgroundImage = `url("${cardImage}")`;

  card.addEventListener('click', () => {
    updateProjectSpotlight(project);
  });

  card.appendChild(title);
  card.appendChild(description);

  return card;
}

function updateProjectSpotlight(project) {
  const spotlight = document.getElementById('projectSpotlight');
  const spotlightTitles = document.getElementById('spotlightTitles');

  if (!spotlight || !spotlightTitles) return;

  while (spotlightTitles.firstChild) {
    spotlightTitles.removeChild(spotlightTitles.firstChild);
  }

  const title = document.createElement('h3');
  title.textContent = project.project_name || 'Untitled Project';

  const description = document.createElement('p');
  description.textContent =
    project.long_description || 'No detailed description available.';

  const link = document.createElement('a');
  link.textContent = 'Click here to see more...';
  link.href = project.url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const spotlightImage = normalizeImagePath(
    project.spotlight_image,
    './images/spotlight_placeholder_bg.webp'
  );

  spotlight.style.backgroundImage = `url("${spotlightImage}")`;

  spotlightTitles.appendChild(title);
  spotlightTitles.appendChild(description);
  spotlightTitles.appendChild(link);
}

function normalizeImagePath(path, fallback) {
  if (!path) return fallback;
  return path.replace('../images/', './images/');
}

function setupProjectNavigation() {
  const projectList = document.getElementById('projectList');
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');

  if (!projectList || !leftArrow || !rightArrow) return;

  leftArrow.addEventListener('click', () => {
    scrollProjects(projectList, -1);
  });

  rightArrow.addEventListener('click', () => {
    scrollProjects(projectList, 1);
  });
}

function scrollProjects(projectList, direction) {
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  const scrollAmount = 250;

  if (isDesktop) {
    projectList.scrollBy({
      top: direction * scrollAmount,
      behavior: 'smooth'
    });
  } else {
    projectList.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }
}

function setupFormValidation() {
  const form = document.getElementById('formSection');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const charactersLeft = document.getElementById('charactersLeft');

  if (
    !form ||
    !emailInput ||
    !messageInput ||
    !emailError ||
    !messageError ||
    !charactersLeft
  ) {
    return;
  }

  updateCharacterCount(messageInput, charactersLeft);

  emailInput.addEventListener('input', () => {
    validateEmail(emailInput, emailError);
  });

  messageInput.addEventListener('input', () => {
    updateCharacterCount(messageInput, charactersLeft);
    validateMessage(messageInput, messageError);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailIsValid = validateEmail(emailInput, emailError);
    const messageIsValid = validateMessage(messageInput, messageError);

    if (emailIsValid && messageIsValid) {
      alert('Form validation passed!');

      form.reset();
      emailError.textContent = '';
      messageError.textContent = '';
      updateCharacterCount(messageInput, charactersLeft);
      charactersLeft.classList.remove('error');
    }
  });
}

function validateEmail(emailInput, emailError) {
  const value = emailInput.value.trim();
  emailError.textContent = '';

  if (value === '') {
    emailError.textContent = 'Email cannot be empty.';
    return false;
  }

  if (ILLEGAL_EMAIL_REGEX.test(value)) {
    emailError.textContent =
      'Email contains illegal characters.';
    return false;
  }

  if (!VALID_EMAIL_REGEX.test(value)) {
    emailError.textContent = 'Please enter a valid email address.';
    return false;
  }

  return true;
}

function validateMessage(messageInput, messageError) {
  const value = messageInput.value.trim();
  messageError.textContent = '';

  if (value === '') {
    messageError.textContent = 'Message cannot be empty.';
    return false;
  }

  if (ILLEGAL_MESSAGE_REGEX.test(value)) {
    messageError.textContent =
      'Message contains illegal characters.';
    return false;
  }

  if (value.length > MAX_MESSAGE_LENGTH) {
    messageError.textContent = `Message must be 300 characters or fewer.`;
    return false;
  }

  return true;
}

function updateCharacterCount(messageInput, charactersLeft) {
  const currentLength = messageInput.value.length;
  const remaining = MAX_MESSAGE_LENGTH - currentLength;

  charactersLeft.textContent = `Characters left: ${remaining}`;

  if (remaining < 0) {
    charactersLeft.classList.add('error');
  } else {
    charactersLeft.classList.remove('error');
  }
}

function updateHeaderName() {
  const heading = document.querySelector('header h1');
  if (heading && heading.textContent.includes('Insert your name here')) {
    heading.textContent = 'Fayzeh Elzghier';
  }
}