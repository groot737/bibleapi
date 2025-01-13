const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isVisible = answer.style.display === 'block';

    // Close all other answers
    document.querySelectorAll('.faq-answer').forEach(ans => (ans.style.display = 'none'));

    // Toggle current answer
    answer.style.display = isVisible ? 'none' : 'block';
  });
});

const slider = document.querySelector('.slider');
const nextButton = document.querySelector('.slider-button.next');
const prevButton = document.querySelector('.slider-button.prev');

let scrollPosition = 0;

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-button");
  const hiddenVersions = document.querySelector(".hidden-versions");

  toggleButton.addEventListener("click", function () {
    if (hiddenVersions.classList.contains("show")) {
      hiddenVersions.classList.remove("show");
      toggleButton.textContent = "Show more...";
    } else {
      hiddenVersions.classList.add("show");
      toggleButton.textContent = "Show less...";
    }
  });
});

