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
  // Wait a bit more for DOM to be fully ready
  setTimeout(function() {
    // Get elements for reveal animation
    const calculatorCTA = document.getElementById('calculatorCTA'); // Now the floating button
    const calculatorFull = document.getElementById('calculatorFull');
    const backToCardBtn = document.getElementById('backToCard');
    const calcBtn = document.getElementById('calcBtn');
    
    // Only proceed if at least the main elements exist
    if (!calculatorCTA && !calculatorFull) {
      return; // Silently return if calculator elements don't exist
    }
    
    // Reveal calculator functionality - floating button click
    if (calculatorCTA && calculatorFull) {
      calculatorCTA.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Hide the floating button
        calculatorCTA.style.display = 'none';
        
        // Show the calculator section
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
        
        // Add slide-in class to full calculator
        setTimeout(() => {
          console.log('Adding slide-in class to full calculator');
          calculatorFull.classList.add('slide-in');
        }, 200);
      });
    }
    
    // Back to card functionality
    if (backToCardBtn && calculatorCTA && calculatorFull) {
      backToCardBtn.addEventListener('click', function(e) {
        console.log('Back button clicked!');
        e.preventDefault();
        e.stopPropagation();
        
        // Remove slide-in class from full calculator
        calculatorFull.classList.remove('slide-in');
        
        // Show the floating button again
        setTimeout(() => {
          calculatorCTA.style.display = 'flex';
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
        e.preventDefault();
        e.stopPropagation();
        performCalculation();
      });
    }
  }, 500);
}

function performCalculation() {
  // Get input values with error handling
  const inputs = {
    dailyDistance: getInputValue('dailyDistance', 20),
    daysPerMonth: getInputValue('daysPerMonth', 22),
    currentTime: getInputValue('currentTime', 60),
    currentConsumption: getInputValue('currentConsumption', 7),
    fuelPrice: getInputValue('fuelPrice', 1.8),
    electricityPrice: getInputValue('electricityPrice', 0.15)
  };
  
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
  initEncomendasButton();
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
// ENCOMENDAS BUTTON FUNCTIONALITY
// ================================

function initEncomendasButton() {
  const encomendasBtn = document.getElementById('encomendasBtn');
  const contactFormSection = document.getElementById('contact-form');
  const serviceTypeSelect = document.getElementById('serviceType');
  
  if (!encomendasBtn || !contactFormSection) {
    console.warn('Encomendas button or contact form section not found');
    return;
  }
  
  // Encomendas button click handler
  encomendasBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show the contact form section
    contactFormSection.style.display = 'block';
    
    // Add fade-in animation
    setTimeout(() => {
      contactFormSection.classList.add('visible');
    }, 10);
    
    // Pre-select "Encomendas" option
    if (serviceTypeSelect) {
      serviceTypeSelect.value = 'Pedido de Orçamento';
      // Trigger change event to show address and delivery fields
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
    const originalText = encomendasBtn.innerHTML;
    encomendasBtn.innerHTML = '<span class="btn-icon">✓</span>Formulário Ativo';
    encomendasBtn.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
    
    setTimeout(() => {
      encomendasBtn.innerHTML = originalText;
      encomendasBtn.style.background = '';
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

// ================================
// DELIVERY COST CALCULATOR
// ================================

function initDeliveryCalculator() {
  const serviceTypeSelect = document.getElementById('serviceType');
  const deliverySection = document.getElementById('deliverySection');
  const deliveryAddress = document.getElementById('deliveryAddress');
  const calculateBtn = document.getElementById('calculateDistance');
  const deliveryCostResult = document.getElementById('deliveryCostResult');
  const distanceValue = document.getElementById('distanceValue');
  const deliveryCostValue = document.getElementById('deliveryCostValue');
  const deliveryNote = document.getElementById('deliveryNote');
  
  if (!serviceTypeSelect || !deliverySection || !calculateBtn) {
    console.warn('Delivery calculator elements not found');
    return;
  }
  
  // Store location (Braga, Portugal)
  const storeLocation = {
    name: 'Centro Comercial Minho Center, Braga',
    lat: 41.5454,
    lng: -8.4265,
    postalCode: '4710'
  };
  
  // Portuguese cities and postal codes database
  const portugueseCities = [
    { name: 'Lisboa', postalCode: '1000', district: 'Lisboa', distance: 365 },
    { name: 'Porto', postalCode: '4000', district: 'Porto', distance: 55 },
    { name: 'Braga', postalCode: '4710', district: 'Braga', distance: 10 },
    { name: 'Coimbra', postalCode: '3000', district: 'Coimbra', distance: 135 },
    { name: 'Faro', postalCode: '8000', district: 'Faro', distance: 575 },
    { name: 'Aveiro', postalCode: '3800', district: 'Aveiro', distance: 90 },
    { name: 'Setúbal', postalCode: '2900', district: 'Setúbal', distance: 395 },
    { name: 'Santarém', postalCode: '2000', district: 'Santarém', distance: 300 },
    { name: 'Leiria', postalCode: '2400', district: 'Leiria', distance: 210 },
    { name: 'Viseu', postalCode: '3500', district: 'Viseu', distance: 125 },
    { name: 'Évora', postalCode: '7000', district: 'Évora', distance: 420 },
    { name: 'Beja', postalCode: '7800', district: 'Beja', distance: 480 },
    { name: 'Castelo Branco', postalCode: '6000', district: 'Castelo Branco', distance: 270 },
    { name: 'Portalegre', postalCode: '7300', district: 'Portalegre', distance: 320 },
    { name: 'Viana do Castelo', postalCode: '4900', district: 'Viana do Castelo', distance: 50 },
    { name: 'Vila Real', postalCode: '5000', district: 'Vila Real', distance: 110 },
    { name: 'Bragança', postalCode: '5300', district: 'Bragança', distance: 195 },
    { name: 'Guarda', postalCode: '6300', district: 'Guarda', distance: 190 },
    { name: 'Guimarães', postalCode: '4800', district: 'Braga', distance: 25 },
    { name: 'Barcelos', postalCode: '4750', district: 'Braga', distance: 20 },
    { name: 'Vila Nova de Famalicão', postalCode: '4760', district: 'Braga', distance: 15 },
    { name: 'Esposende', postalCode: '4740', district: 'Braga', distance: 35 },
    { name: 'Póvoa de Varzim', postalCode: '4490', district: 'Porto', distance: 45 },
    { name: 'Matosinhos', postalCode: '4450', district: 'Porto', distance: 60 },
    { name: 'Vila do Conde', postalCode: '4480', district: 'Porto', distance: 50 },
    { name: 'Gondomar', postalCode: '4420', district: 'Porto', distance: 58 },
    { name: 'Maia', postalCode: '4470', district: 'Porto', distance: 52 },
    { name: 'Valongo', postalCode: '4440', district: 'Porto', distance: 55 },
    { name: 'Figueira da Foz', postalCode: '3080', district: 'Coimbra', distance: 170 },
    { name: 'Oliveira de Azeméis', postalCode: '3720', district: 'Aveiro', distance: 75 },
    { name: 'Torres Vedras', postalCode: '2560', district: 'Lisboa', distance: 330 },
    { name: 'Sintra', postalCode: '2710', district: 'Lisboa', distance: 370 },
    { name: 'Cascais', postalCode: '2750', district: 'Lisboa', distance: 380 },
    { name: 'Oeiras', postalCode: '2780', district: 'Lisboa', distance: 375 },
    { name: 'Almada', postalCode: '2800', district: 'Setúbal', distance: 390 },
    { name: 'Amadora', postalCode: '2700', district: 'Lisboa', distance: 368 }
  ];
  
  // Autocomplete functionality
  const addressSuggestions = document.getElementById('addressSuggestions');
  let selectedSuggestionIndex = -1;
  
  deliveryAddress.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    
    if (query.length < 2) {
      addressSuggestions.classList.remove('active');
      return;
    }
    
    // Filter cities by name or postal code
    const matches = portugueseCities.filter(city => {
      return city.name.toLowerCase().includes(query) || 
             city.postalCode.includes(query) ||
             city.district.toLowerCase().includes(query);
    }).slice(0, 8); // Limit to 8 suggestions
    
    if (matches.length === 0) {
      addressSuggestions.classList.remove('active');
      return;
    }
    
    // Build suggestions HTML
    const suggestionsHTML = matches.map((city, index) => `
      <div class="suggestion-item" data-index="${index}" data-city="${city.name}" data-postal="${city.postalCode}">
        <span class="suggestion-icon">📍</span>
        <div class="suggestion-content">
          <div class="suggestion-main">${city.name}</div>
          <div class="suggestion-sub">${city.postalCode} - ${city.district}</div>
        </div>
        <div class="suggestion-distance">~${city.distance} km</div>
      </div>
    `).join('');
    
    addressSuggestions.innerHTML = suggestionsHTML;
    addressSuggestions.classList.add('active');
    selectedSuggestionIndex = -1;
    
    // Add click handlers
    addressSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', function() {
        const cityName = this.getAttribute('data-city');
        const postalCode = this.getAttribute('data-postal');
        deliveryAddress.value = `${cityName} - ${postalCode}`;
        addressSuggestions.classList.remove('active');
        
        // Auto-calculate when suggestion is selected
        setTimeout(() => {
          calculateBtn.click();
        }, 100);
      });
    });
  });
  
  // Keyboard navigation for suggestions
  deliveryAddress.addEventListener('keydown', function(e) {
    const suggestions = addressSuggestions.querySelectorAll('.suggestion-item');
    
    if (!addressSuggestions.classList.contains('active') || suggestions.length === 0) {
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
      updateSelectedSuggestion(suggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
      updateSelectedSuggestion(suggestions);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      suggestions[selectedSuggestionIndex].click();
    } else if (e.key === 'Escape') {
      addressSuggestions.classList.remove('active');
    }
  });
  
  function updateSelectedSuggestion(suggestions) {
    suggestions.forEach((item, index) => {
      if (index === selectedSuggestionIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!deliveryAddress.contains(e.target) && !addressSuggestions.contains(e.target)) {
      addressSuggestions.classList.remove('active');
    }
  });
  
  // Customer address fields
  const customerAddressSection = document.getElementById('customerAddressSection');
  const customerAddress = document.getElementById('customerAddress');
  const streetNumber = document.getElementById('streetNumber');
  
  // Show/hide delivery section and customer address based on service type
  serviceTypeSelect.addEventListener('change', function() {
    const value = this.value;
    if (value === 'Pedido de Orçamento') {
      // Show customer address section
      if (customerAddressSection) {
        customerAddressSection.style.display = 'grid';
        // Make address fields required
        if (customerAddress) customerAddress.required = true;
        if (streetNumber) streetNumber.required = true;
      }
      // Show delivery calculator section
      deliverySection.style.display = 'block';
    } else {
      // Hide customer address section
      if (customerAddressSection) {
        customerAddressSection.style.display = 'none';
        // Make address fields not required
        if (customerAddress) customerAddress.required = false;
        if (streetNumber) streetNumber.required = false;
      }
      // Hide delivery calculator section
      deliverySection.style.display = 'none';
      deliveryCostResult.style.display = 'none';
      addressSuggestions.classList.remove('active');
    }
  });
  
  // Calculate delivery cost function
  calculateBtn.addEventListener('click', function() {
    const address = deliveryAddress.value.trim();
    
    if (!address) {
      alert('Por favor, introduza um endereço de entrega.');
      return;
    }
    
    // Show loading state
    deliveryCostResult.style.display = 'block';
    distanceValue.textContent = 'A calcular...';
    deliveryCostValue.textContent = 'A calcular...';
    deliveryNote.textContent = '';
    
    // Calculate distance and cost
    calculateDistanceAndCost(address);
  });
  
  function calculateDistanceAndCost(address) {
    // Try to use geocoding to get coordinates
    // For a simple implementation without external API, we'll use postal code matching
    const postalCodeMatch = address.match(/\b(\d{4})[-\s]?(\d{3})?\b/);
    
    if (postalCodeMatch) {
      const postalCode = postalCodeMatch[1];
      const distance = estimateDistanceByPostalCode(postalCode);
      const cost = calculateCost(distance);
      displayResult(distance, cost);
    } else {
      // If we can't find a postal code, try city-based estimation
      const distance = estimateDistanceByCityName(address);
      const cost = calculateCost(distance);
      displayResult(distance, cost);
    }
  }
  
  function estimateDistanceByPostalCode(postalCode) {
    // Portuguese postal code distance estimation - FIXED accurate distances
    const code = parseInt(postalCode);
    
    // Lisboa area (1000-1999)
    if (code >= 1000 && code <= 1999) {
      return 365;
    }
    // Santarém area (2000-2099)
    else if (code >= 2000 && code <= 2099) {
      return 300;
    }
    // Leiria area (2400-2499)
    else if (code >= 2400 && code <= 2499) {
      return 210;
    }
    // Torres Vedras area (2560-2569)
    else if (code >= 2560 && code <= 2569) {
      return 330;
    }
    // Setúbal area (2900-2999)
    else if (code >= 2900 && code <= 2999) {
      return 395;
    }
    // Coimbra area (3000-3099)
    else if (code >= 3000 && code <= 3099) {
      return 135;
    }
    // Figueira da Foz area (3080-3089)
    else if (code >= 3080 && code <= 3089) {
      return 170;
    }
    // Viseu area (3500-3599)
    else if (code >= 3500 && code <= 3599) {
      return 125;
    }
    // Aveiro area (3800-3899)
    else if (code >= 3800 && code <= 3899) {
      return 90;
    }
    // Porto area (4000-4499)
    else if (code >= 4000 && code <= 4499) {
      return 55;
    }
    // Póvoa de Varzim area (4490-4499)
    else if (code >= 4490 && code <= 4499) {
      return 45;
    }
    // Braga area (4700-4719)
    else if (code >= 4700 && code <= 4719) {
      return 10;
    }
    // Guimarães area (4800-4839)
    else if (code >= 4800 && code <= 4839) {
      return 25;
    }
    // Viana do Castelo area (4900-4999)
    else if (code >= 4900 && code <= 4999) {
      return 50;
    }
    // Vila Real area (5000-5099)
    else if (code >= 5000 && code <= 5099) {
      return 110;
    }
    // Bragança area (5300-5399)
    else if (code >= 5300 && code <= 5399) {
      return 195;
    }
    // Portalegre area (7300-7399)
    else if (code >= 7300 && code <= 7399) {
      return 320;
    }
    // Évora area (7000-7099)
    else if (code >= 7000 && code <= 7099) {
      return 420;
    }
    // Beja area (7800-7899)
    else if (code >= 7800 && code <= 7899) {
      return 480;
    }
    // Faro area (8000-8999)
    else if (code >= 8000 && code <= 8999) {
      return 575;
    }
    // Castelo Branco area (6000-6099)
    else if (code >= 6000 && code <= 6099) {
      return 270;
    }
    // Guarda area (6300-6399)
    else if (code >= 6300 && code <= 6399) {
      return 190;
    }
    // Default estimation for unknown postal codes
    else {
      // Try to estimate by first digit
      const firstDigit = Math.floor(code / 1000);
      if (firstDigit === 1 || firstDigit === 2) {
        return 325; // Lisboa/Central area
      } else if (firstDigit === 3) {
        return 125; // Central/North area
      } else if (firstDigit === 4) {
        return 55; // North area
      } else if (firstDigit === 5) {
        return 120; // Interior North
      } else if (firstDigit === 6 || firstDigit === 7) {
        return 325; // Interior/Alentejo
      } else if (firstDigit === 8 || firstDigit === 9) {
        return 525; // Algarve
      }
      return 150; // Default fallback
    }
  }
  
  function estimateDistanceByCityName(address) {
    const lowerAddress = address.toLowerCase();
    
    // City distance mappings - FIXED accurate distances
    const cityDistances = {
      'braga': 10,
      'porto': 55,
      'guimarães': 25,
      'barcelos': 20,
      'viana do castelo': 50,
      'viana': 50,
      'vila nova de famalicão': 15,
      'famalicão': 15,
      'esposende': 35,
      'póvoa de varzim': 45,
      'lisboa': 365,
      'coimbra': 135,
      'aveiro': 90,
      'faro': 575,
      'évora': 420,
      'bragança': 195,
      'vila real': 110,
      'viseu': 125,
      'leiria': 210,
      'setúbal': 395,
      'santarém': 300,
      'beja': 480,
      'portalegre': 320,
      'castelo branco': 270,
      'guarda': 190
    };
    
    for (const [city, distance] of Object.entries(cityDistances)) {
      if (lowerAddress.includes(city)) {
        return distance;
      }
    }
    
    // Default if no match
    return 150;
  }
  
  function calculateCost(distance) {
    // NEW PRICING: 1€ per km
    // 0-20 km: FREE (promotional free delivery for local area)
    // 21+ km: 1€ per km
    
    if (distance <= 20) {
      return 0;
    } else {
      return distance; // 1€ per km
    }
  }
  
  function displayResult(distance, cost) {
    distanceValue.textContent = `${distance} km`;
    
    if (cost === 0) {
      deliveryCostValue.textContent = 'GRÁTIS';
      deliveryNote.innerHTML = '🎉 <strong>Entrega gratuita!</strong> Está dentro da nossa área de entrega sem custos adicionais.';
      deliveryNote.classList.add('free-delivery');
    } else {
      deliveryCostValue.textContent = `${cost}€`;
      deliveryNote.innerHTML = `<strong>Nota:</strong> O custo de entrega é estimado com base na distância. O valor final será confirmado após análise do percurso e condições de entrega.`;
      deliveryNote.classList.remove('free-delivery');
    }
    
    // Add animation effect
    deliveryCostResult.style.animation = 'none';
    setTimeout(() => {
      deliveryCostResult.style.animation = 'slideDown 0.4s ease';
    }, 10);
  }
}

// Initialize delivery calculator when DOM is ready
document.addEventListener('DOMContentLoaded', initDeliveryCalculator);