document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
          </div>
        `;

        // Build participants list with delete buttons
        const participantsSection = activityCard.querySelector('.participants-section');
        const ul = document.createElement('ul');
        ul.className = 'participants-list';

        if (details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement('li');

            const span = document.createElement('span');
            span.className = 'participant-item';
            span.textContent = p;

            const btn = document.createElement('button');
            btn.className = 'delete-icon';
            btn.setAttribute('aria-label', `Remove ${p}`);
            btn.innerHTML = '✖';
            btn.addEventListener('click', async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: 'DELETE' }
                );

                const result = await response.json();

                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  // Refresh activities to reflect change
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }

                // Hide message after 5 seconds
                setTimeout(() => {
                  messageDiv.classList.add('hidden');
                }, 5000);
              } catch (error) {
                console.error('Error removing participant:', error);
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          const em = document.createElement('em');
          em.textContent = 'No participants yet';
          li.appendChild(em);
          ul.appendChild(li);
        }

        participantsSection.appendChild(ul);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show the newly registered participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
