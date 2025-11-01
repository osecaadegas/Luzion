// Debug: Script loading
console.log('Script loaded');

// Intersection Observer para animar elementos ao aparecer no ecrã
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in, .slide-up, .design-img, .about-img, .industry-img').forEach(el => {
  observer.observe(el);
});

// Generic inline SVG fallback generator
function svgFallback(text, w = 800, h = 500) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="#012147" />
      <text x="50%" y="50%" fill="#7aafff" font-family="Poppins, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `);
}

// Fallback handlers for images that may be missing
document.querySelectorAll('.about-img, .industry-img, .design-img, .vantagens-img').forEach(img => {
  img.addEventListener('error', () => {
    img.src = svgFallback('Imagem indisponível');
    // ensure animation still triggers
    img.classList.add('visible');
  });
  // in case image is already cached as missing, trigger error handler manually
  if (img.complete && img.naturalWidth === 0) {
    img.dispatchEvent(new Event('error'));
  }
});

// Smooth scroll para links do menu
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    if (link.hash) {
      e.preventDefault();
      const targetSection = document.querySelector(link.hash);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Popup functionality (shared between contact and calculator)
const contactPopup = document.getElementById('contact-popup');
// ===============================================
// CALCULATOR FUNCTIONALITY - SECTION BASED
// ===============================================

// Calculator elements
const calcBtn = document.getElementById('calcBtn');
const resultsSection = document.getElementById('results');

// Calculator reveal functionality
function initCalculator() {
  console.log('Initializing calculator...');
  
  // Set flag to prevent double initialization
  window.calculatorInitialized = true;
  
  // Wait a bit more for DOM to be fully ready
  setTimeout(function() {
    // Get elements for reveal animation
    const revealCalculatorBtn = document.getElementById('revealCalculator');
    const calculatorCTA = document.getElementById('calculatorCTA');
    const calculatorFull = document.getElementById('calculatorFull');
    const backToCardBtn = document.getElementById('backToCard');
    const calcBtn = document.getElementById('calcBtn');
    
    console.log('Elements check:', {
      revealCalculatorBtn: !!revealCalculatorBtn,
      calculatorCTA: !!calculatorCTA,
      calculatorFull: !!calculatorFull,
      backToCardBtn: !!backToCardBtn,
      calcBtn: !!calcBtn
    });
    
    console.log('Actual elements:', {
      revealCalculatorBtn,
      calculatorCTA,
      calculatorFull,
      backToCardBtn,
      calcBtn
    });
    
    // Reveal calculator functionality
    if (revealCalculatorBtn && calculatorCTA && calculatorFull) {
      console.log('Setting up reveal calculator listener...');
      revealCalculatorBtn.addEventListener('click', function(e) {
        console.log('Reveal calculator button clicked!');
        e.preventDefault();
        e.stopPropagation();
        
        // Show the calculator section first
        const calculatorSection = document.getElementById('calculator');
        if (calculatorSection) {
          calculatorSection.style.display = 'flex';
          // Trigger animation after a small delay to ensure display is set
          setTimeout(() => {
            calculatorSection.classList.add('show');
            // Smooth scroll to calculator section
            calculatorSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 50);
        }
        
        // Add slide-out class to CTA card with enhanced animation
        console.log('Adding slide-out class to CTA card');
        console.log('CTA card before:', calculatorCTA.className);
        calculatorCTA.classList.add('slide-out');
        console.log('CTA card after:', calculatorCTA.className);
        
        // Add slide-in class to full calculator after the card slide-out completes
        setTimeout(() => {
          console.log('Adding slide-in class to full calculator');
          console.log('Full calculator before:', calculatorFull.className);
          calculatorFull.classList.add('slide-in');
          console.log('Full calculator after:', calculatorFull.className);
        }, 400); // Increased delay to match the new card animation
      });
      console.log('Reveal calculator listener attached successfully');
    } else {
      console.error('Missing elements for reveal functionality');
      console.error('revealCalculatorBtn:', revealCalculatorBtn);
      console.error('calculatorCTA:', calculatorCTA);
      console.error('calculatorFull:', calculatorFull);
    }
    
    // Back to card functionality
    if (backToCardBtn && calculatorCTA && calculatorFull) {
      backToCardBtn.addEventListener('click', function(e) {
        console.log('Back to card button clicked!');
        e.preventDefault();
        e.stopPropagation();
        
        // Remove slide-in class from full calculator
        calculatorFull.classList.remove('slide-in');
        
        // Remove slide-out class from CTA card after a short delay
        setTimeout(() => {
          calculatorCTA.classList.remove('slide-out');
          // Hide results when going back
          const resultsSection = document.getElementById('results');
          if (resultsSection) {
            resultsSection.classList.remove('show-results');
            setTimeout(() => {
              resultsSection.style.display = 'none';
            }, 300);
          }
        }, 300);
        
        // Hide the calculator section after animations complete
        setTimeout(() => {
          const calculatorSection = document.getElementById('calculator');
          if (calculatorSection) {
            calculatorSection.classList.remove('show');
            setTimeout(() => {
              calculatorSection.style.display = 'none';
            }, 800); // Wait for the fade-out animation to complete
          }
        }, 600);
      });
    }
    
    // Calculate button
    if (calcBtn) {
      // Remove existing listeners to prevent duplicates
      calcBtn.removeEventListener('click', performCalculation);
      calcBtn.addEventListener('click', function(e) {
        console.log('Calculate button clicked!', e);
        e.preventDefault();
        e.stopPropagation();
        console.log('About to call performCalculation...');
        performCalculation();
        console.log('performCalculation called');
      });
      console.log('Calculator button listener attached');
    } else {
      console.error('Calculate button not found');
    }
  }, 500);
}

function performCalculation() {
  console.log('Performing calculation...');
  
  // Get input values with error handling
  const inputs = {
    dailyDistance: getInputValue('dailyDistance', 20),
    daysPerMonth: getInputValue('daysPerMonth', 22),
    currentTime: getInputValue('currentTime', 60),
    currentConsumption: getInputValue('currentConsumption', 7),
    fuelPrice: getInputValue('fuelPrice', 1.8),
    electricityPrice: getInputValue('electricityPrice', 0.15)
  };
  
  console.log('Input values:', inputs);
  
  // Validate inputs
  if (!validateInputs(inputs)) {
    alert('Por favor, verifique se todos os valores estão corretos.');
    return;
  }
  
  // Calculate results
  const results = calculateSavings(inputs);
  console.log('Calculation results:', results);
  
  // Display results
  displayResults(results);
}

function getInputValue(id, defaultValue) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found, using default value:`, defaultValue);
    return defaultValue;
  }
  
  const value = parseFloat(element.value);
  return isNaN(value) ? defaultValue : Math.max(0, value);
}

function validateInputs(inputs) {
  // Basic validation
  if (inputs.dailyDistance <= 0 || inputs.dailyDistance > 500) return false;
  if (inputs.daysPerMonth <= 0 || inputs.daysPerMonth > 31) return false;
  if (inputs.currentConsumption <= 0 || inputs.currentConsumption > 20) return false;
  if (inputs.fuelPrice <= 0 || inputs.fuelPrice > 5) return false;
  if (inputs.electricityPrice <= 0 || inputs.electricityPrice > 1) return false;
  
  return true;
}

function calculateSavings(inputs) {
  // Constants
  const LUZION_CONSUMPTION = 10; // kWh/100km
  const CO2_PER_LITER = 2.31; // kg CO2 per liter of gasoline
  
  // Monthly calculations
  const monthlyDistance = inputs.dailyDistance * inputs.daysPerMonth;
  
  // Current vehicle costs
  const currentFuelConsumption = (monthlyDistance / 100) * inputs.currentConsumption; // liters/month
  const currentMonthlyCost = currentFuelConsumption * inputs.fuelPrice;
  
  // Luzion costs
  const luzionEnergyConsumption = (monthlyDistance / 100) * LUZION_CONSUMPTION; // kWh/month
  const luzionMonthlyCost = luzionEnergyConsumption * inputs.electricityPrice;
  
  // Savings
  const monthlySavings = currentMonthlyCost - luzionMonthlyCost;
  const yearlySavings = monthlySavings * 12;
  
  // Cost per 100km
  const currentCostPer100km = inputs.currentConsumption * inputs.fuelPrice;
  const luzionCostPer100km = LUZION_CONSUMPTION * inputs.electricityPrice;
  
  // CO2 savings
  const co2Saved = currentFuelConsumption * CO2_PER_LITER; // kg/month
  
  return {
    monthlySavings: Math.max(0, monthlySavings),
    yearlySavings: Math.max(0, yearlySavings),
    currentCostPer100km,
    luzionCostPer100km,
    co2Saved: Math.max(0, co2Saved)
  };
}

function displayResults(results) {
  // Show results section
  if (resultsSection) {
    resultsSection.style.display = 'block';
    setTimeout(() => {
      resultsSection.classList.add('show-results');
    }, 50);
  }
  
  // Update result values
  updateResultElement('moneySaved', `${results.monthlySavings.toFixed(2)} €`);
  updateResultElement('yearSavings', `${results.yearlySavings.toFixed(2)} €`);
  updateResultElement('emissionSavings', `${results.co2Saved.toFixed(1)} kg/mês`);
  updateResultElement('currentCost', `${results.currentCostPer100km.toFixed(2)} €`);
  updateResultElement('luzionCost', `${results.luzionCostPer100km.toFixed(2)} €`);
  
  // Animate result cards
  const resultCards = document.querySelectorAll('.result-card');
  resultCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate');
    }, index * 100);
  });
  
  // Scroll to results if needed
  setTimeout(() => {
    resultsSection?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }, 300);
}

function updateResultElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  } else {
    console.warn(`Result element with id '${id}' not found`);
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', initCalculator);

// Also try to initialize on window load as backup
window.addEventListener('load', function() {
  // Only initialize if not already done
  if (!window.calculatorInitialized) {
    setTimeout(initCalculator, 100);
  }
});

// Add a flag to prevent double initialization
window.calculatorInitialized = false;

// ================================
// CONTACT FORM FUNCTIONALITY
// ================================

document.addEventListener('DOMContentLoaded', function() {
  initContactForm();
  initTestDriveButton();
});

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const serviceTypeSelect = document.getElementById('serviceType');
  const testDriveDateGroup = document.getElementById('testDriveDate');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  
  if (!contactForm) {
    console.warn('Contact form not found');
    return;
  }
  
  // Show/hide test drive date fields based on service type
  serviceTypeSelect?.addEventListener('change', function() {
    if (this.value === 'Agendar Test Drive') {
      testDriveDateGroup.style.display = 'block';
      // Make date and time required for test drives
      document.getElementById('preferredDate').required = true;
      document.getElementById('preferredTime').required = true;
    } else {
      testDriveDateGroup.style.display = 'none';
      // Remove required attribute when not visible
      document.getElementById('preferredDate').required = false;
      document.getElementById('preferredTime').required = false;
    }
  });
  
  // Set minimum date to today for test drive scheduling
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }
  
  // Form submission handler
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateContactForm()) {
      return;
    }
    
    // Show loading state
    const submitButton = contactForm.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="button-icon">⏳</span>Enviando...';
    submitButton.disabled = true;
    
    // Prepare form data for Web3Forms
    const formData = new FormData(contactForm);
    
    // Submit to Web3Forms
    fetch(contactForm.action, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Reset button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      
      if (data.success) {
        // Show success message and hide form
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        
        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset form after showing success
        setTimeout(() => {
          contactForm.reset();
          testDriveDateGroup.style.display = 'none';
          document.getElementById('preferredDate').required = false;
          document.getElementById('preferredTime').required = false;
        }, 1000);
        
      } else {
        // Show error message
        console.error('Web3Forms Error:', data);
        formError.querySelector('p').textContent = data.message || 'Erro ao enviar mensagem. Tente novamente.';
        formError.style.display = 'block';
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    })
    .catch(error => {
      // Reset button and show error
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
      
      console.error('Network Error:', error);
      formError.querySelector('p').textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
      formError.style.display = 'block';
      formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  
  // Add input validation styling
  const inputs = contactForm.querySelectorAll('input[required], select[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

function validateContactForm() {
  const form = document.getElementById('contactForm');
  const requiredFields = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // Validate email format
  const emailField = document.getElementById('email');
  if (emailField && emailField.value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailField.value)) {
      showFieldError(emailField, 'Por favor, insira um email válido');
      isValid = false;
    }
  }
  
  // Validate phone format (Portuguese phone numbers)
  const phoneField = document.getElementById('phone');
  if (phoneField && phoneField.value) {
    const phonePattern = /^(\+351\s?)?[29]\d{8}$/;
    if (!phonePattern.test(phoneField.value.replace(/\s/g, ''))) {
      showFieldError(phoneField, 'Por favor, insira um número de telefone válido (ex: 912345678 ou +351 912345678)');
      isValid = false;
    }
  }
  
  // Validate privacy checkbox
  const privacyCheckbox = document.getElementById('privacy');
  if (privacyCheckbox && !privacyCheckbox.checked) {
    showFieldError(privacyCheckbox, 'Deve aceitar a Política de Privacidade para continuar');
    isValid = false;
  }
  
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  
  // Remove previous error state
  clearFieldError(field);
  
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'Este campo é obrigatório');
    return false;
  }
  
  return true;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Create or update error message
  let errorElement = field.parentNode.querySelector('.field-error');
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    field.parentNode.appendChild(errorElement);
  }
  errorElement.textContent = message;
  
  // Add error styling to form group
  field.parentNode.classList.add('has-error');
}

function clearFieldError(field) {
  field.classList.remove('error');
  field.parentNode.classList.remove('has-error');
  
  const errorElement = field.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
}

// Utility function to format form data for email
function formatFormDataForEmail() {
  const form = document.getElementById('contactForm');
  const formData = new FormData(form);
  
  let emailBody = 'Nova solicitação de contacto do website Luzion:\n\n';
  
  emailBody += `Nome: ${formData.get('fullName')}\n`;
  emailBody += `Email: ${formData.get('email')}\n`;
  emailBody += `Telefone: ${formData.get('phone')}\n`;
  emailBody += `Tipo de Solicitação: ${getServiceTypeLabel(formData.get('serviceType'))}\n`;
  
  if (formData.get('serviceType') === 'test-drive') {
    emailBody += `Data Preferida: ${formData.get('preferredDate')}\n`;
    emailBody += `Horário Preferido: ${formData.get('preferredTime')}\n`;
  }
  
  if (formData.get('message')) {
    emailBody += `\nMensagem:\n${formData.get('message')}\n`;
  }
  
  emailBody += `\nNewsletter: ${formData.get('newsletter') ? 'Sim' : 'Não'}\n`;
  emailBody += `Data/Hora da submissão: ${new Date().toLocaleString('pt-PT')}\n`;
  
  return emailBody;
}

function getServiceTypeLabel(value) {
  const labels = {
    'test-drive': 'Agendar Test Drive',
    'contact-request': 'Solicitar Contacto',
    'information': 'Informações Gerais',
    'quote': 'Pedido de Orçamento'
  };
  return labels[value] || value;
}

// Add CSS for form validation errors
const style = document.createElement('style');
style.textContent = `
  .form-group.has-error input,
  .form-group.has-error select,
  .form-group.has-error textarea {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
  }
  
  .field-error {
    display: block;
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }
  
  .checkbox-group.has-error .checkmark {
    border-color: #ef4444 !important;
  }
`;
document.head.appendChild(style);

// ================================
// TEST DRIVE BUTTON FUNCTIONALITY
// ================================

function initTestDriveButton() {
  const testDriveBtn = document.getElementById('testDriveBtn');
  const contactFormSection = document.getElementById('contact-form');
  const serviceTypeSelect = document.getElementById('serviceType');
  
  if (!testDriveBtn || !contactFormSection) {
    console.warn('Test drive button or contact form section not found');
    return;
  }
  
  // Test drive button click handler
  testDriveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show the contact form section
    contactFormSection.style.display = 'block';
    
    // Add fade-in animation
    setTimeout(() => {
      contactFormSection.classList.add('visible');
    }, 10);
    
    // Pre-select "Agendar Test Drive" option
    if (serviceTypeSelect) {
      serviceTypeSelect.value = 'Agendar Test Drive';
      // Trigger change event to show date/time fields
      serviceTypeSelect.dispatchEvent(new Event('change'));
    }
    
    // Scroll to the form smoothly
    setTimeout(() => {
      contactFormSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
    
    // Change button text temporarily to show action
    const originalText = testDriveBtn.innerHTML;
    testDriveBtn.innerHTML = '<span class="btn-icon">✓</span>Formulário Ativo';
    testDriveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
      testDriveBtn.innerHTML = originalText;
      testDriveBtn.style.background = '';
    }, 2000);
  });
}

// ================================
// POLICY MODAL FUNCTIONALITY
// ================================

function initPolicyModal() {
  const modal = document.getElementById('policyModal');
  const modalBody = document.getElementById('policyModalBody');
  const closeBtn = document.querySelector('.policy-modal-close');
  const policyLinks = document.querySelectorAll('.policy-link');
  
  if (!modal || !modalBody || !closeBtn) {
    console.warn('Policy modal elements not found');
    return;
  }
  
  // Function to open modal and load content
  function openModal(policyFile) {
    // Show loading state
    modalBody.innerHTML = `
      <section style="padding: 60px 40px; text-align: center; font-family: 'Poppins', sans-serif; background: #ffffff;">
        <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #00aaff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="color: #666; margin-top: 20px;">A carregar...</p>
      </section>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Fetch the policy file content
    fetch(policyFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Load the content into modal
        modalBody.innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading policy:', error);
        const isFileProtocol = window.location.protocol === 'file:';
        modalBody.innerHTML = `
          <section style="padding: 60px 40px; text-align: center; font-family: 'Poppins', sans-serif; background: #ffffff; color: #333;">
            <h1 style="color: #00aaff; margin-bottom: 20px;">⚠️ Servidor Local Necessário</h1>
            <p style="color: #666; margin-bottom: 20px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
              ${isFileProtocol ? 
                'Para visualizar as políticas, é necessário executar o site através de um servidor local.' : 
                'Não foi possível carregar o conteúdo solicitado.'}
            </p>
            ${isFileProtocol ? `
            <div style="background: #f0f9ff; border: 2px solid #00aaff; border-radius: 12px; padding: 30px; max-width: 700px; margin: 30px auto; text-align: left;">
              <h3 style="color: #00aaff; margin-bottom: 15px; text-align: center;">🚀 Como Iniciar o Servidor</h3>
              <p style="color: #666; margin-bottom: 15px; font-weight: 600;">No VS Code:</p>
              <ol style="color: #666; padding-left: 20px; line-height: 2;">
                <li>Clique com o botão direito no ficheiro <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">index.html</code></li>
                <li>Selecione <strong>"Open with Live Server"</strong></li>
                <li>O site abrirá automaticamente no navegador</li>
              </ol>
              <p style="color: #999; font-size: 0.85rem; margin-top: 20px; text-align: center; font-style: italic;">
                Após iniciar o servidor, as políticas aparecerão perfeitamente nesta janela modal! ✨
              </p>
            </div>
            <p style="color: #999; font-size: 0.85rem; margin-top: 20px;">
              Enquanto isso, pode visualizar as políticas diretamente nos ficheiros: <br>
              <strong style="color: #00aaff;">${policyFile}</strong>
            </p>
            ` : `
            <p style="color: #999; font-size: 0.9rem;">Erro: ${error.message}</p>
            <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">Ficheiro: ${policyFile}</p>
            `}
          </section>
        `;
      });
  }
  
  // Function to close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear content after animation
    setTimeout(() => {
      modalBody.innerHTML = '';
    }, 300);
  }
  
  // Add click event to all policy links
  policyLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const policyFile = this.getAttribute('data-policy');
      if (policyFile) {
        openModal(policyFile);
      }
    });
  });
  
  // Close button click
  closeBtn.addEventListener('click', closeModal);
  
  // Close when clicking outside the modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// Initialize policy modal when DOM is ready
document.addEventListener('DOMContentLoaded', initPolicyModal);