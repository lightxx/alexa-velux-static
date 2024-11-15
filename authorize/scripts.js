document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const velux_user_id = document.getElementById('username').value;
    const velux_password = document.getElementById('password').value;

    document.getElementById('loadingSpinner').style.display = 'block';

    try {
        const response = await fetch('https://g255fhmrt4stqqnkcpzt7e2ode0kivdb.lambda-url.eu-west-1.on.aws/register_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ velux_user_id, velux_password })
        });

        const responseData = await response.json();
        const modal = new bootstrap.Modal(response.ok ? document.getElementById('successModal') : document.getElementById('failureModal'));

        const messageElement = response.ok ? document.getElementById('successMessage') : document.getElementById('failureMessage');
        messageElement.textContent = (response.ok ? "Account successfully linked!" : "Failed to link account. Please try again.");

        document.getElementById('loadingSpinner').style.display = 'none';
        modal.show();

        if (response.ok) {
            const closeButton = document.getElementById('closeButton');
            closeButton.disabled = false;
            closeButton.removeAttribute('disabled');
            closeButton.classList.remove('disabled'); 
            closeButton.classList.add('btn-primary'); 

            const redirectUrl = queryParams.redirect_uri + "?state=" + encodeURIComponent(queryParams.state) + "&code=" + responseData.message.code;

            closeButton.addEventListener('click', () => {
                window.location.href = redirectUrl;
            });

            if (responseData.homeInfo) {
                displayHomeInfo(responseData.homeInfo.body.homes);
            }
        }
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        const failureModal = new bootstrap.Modal(document.getElementById('failureModal'));
        document.getElementById('failureMessage').textContent = "An unexpected error occurred. Please try again.";
        failureModal.show();
    }
});


function displayHomeInfo(homes) {
    const homeInfoContainer = document.getElementById('homeInfoContainer');
    const homeInfoContent = document.getElementById('homeInfoContent');

    homeInfoContent.innerHTML = '';
    homes.forEach(home => {
        const homeCard = `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="bi bi-house-fill me-2"></i>${home.name} <span class="badge bg-secondary">${home.country}</span>
                    </h5>
                </div>
                <div class="card-body">
                    <p><strong>City:</strong> ${home.city}</p>
                    <p><strong>Altitude:</strong> ${home.altitude} meters</p>
                    <p><strong>Coordinates:</strong> [${home.coordinates.join(', ')}]</p>
                    <p><strong>Timezone:</strong> ${home.timezone}</p>
                    <h6 class="mt-3"><i class="bi bi-door-open-fill me-2"></i>Rooms:</h6>
                    <ul class="list-group mb-3">
                        ${home.rooms.map(room => {
                            return `
                                <li class="list-group-item">
                                    <strong><i class="bi bi-door-closed-fill me-2"></i>${room.name}</strong> (${room.type})
                                    <div class="row row-cols-1 row-cols-md-2 g-3 mt-2">
                                        ${room.module_ids.map(moduleId => {
                                            const module = home.modules.find(m => m.id === moduleId);
                                            if (module) {
                                                return `
                                                    <div class="col">
                                                        <div class="card h-100">
                                                            <div class="card-body">
                                                                <p><i class="bi bi-gear-fill me-2"></i><strong>Module Name:</strong> ${module.name}</p>
                                                                <p><strong>Type:</strong> ${module.type}</p>
                                                                <p><strong>ID:</strong> ${module.id}</p>
                                                                ${module.velux_type ? `<p><strong>Velux Type:</strong> ${module.velux_type}</p>` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            }
                                            return '';
                                        }).join('')}
                                    </div>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            </div>
        `;
        homeInfoContent.innerHTML += homeCard;
    });

    homeInfoContainer.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    const disclaimerCheckbox = document.getElementById('disclaimerCheckbox');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitButton');

    function checkConditions() {
        if (
            usernameInput.value.trim() !== '' &&
            passwordInput.value.trim() !== '' &&
            disclaimerCheckbox.checked
        ) {
            submitButton.disabled = false; 
        } else {
            submitButton.disabled = true;
        }
    }

    [disclaimerCheckbox, usernameInput, passwordInput].forEach(element => {
        element.addEventListener('input', checkConditions);
        element.addEventListener('change', checkConditions);
    });
});

let queryParams = {};

window.onload = () => {
    const queryString = window.location.search;
  
    const params = new URLSearchParams(queryString);
  
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
  
    console.log(queryParams);
  };