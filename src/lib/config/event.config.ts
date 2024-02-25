const config = {
  event: {
    calendarUrl:
      "https://calendar.google.com/calendar/embed?src=2bd0bc6f74589224539f10fb141b809e2b2ae0863e500225868e3e67620cf677%40group.calendar.google.com&ctz=America%2FToronto",
    suggestionUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfSPXRG02mReQ0XXx82Qyl2hubR32LiGUrgOu848EB-jwiCQg/viewform?usp=sf_link",
    planningQuestionaireUrl:
      "https://docs.google.com/document/d/1zb9WZz7pkL1VQTCu8zDnfy_aiTfIhHf-O8C7oViRAwk/edit?usp=sharing",
    eventPlanningUrl:
      "https://docs.google.com/document/d/1khMBhGCGauBC-xTITrf6jLMCGWaHFQsn4T-1nGtOoBY/edit?usp=sharing",
    default: {
      name: "Event",
      description: "Empty event description",
      date: "No date provided",
      location: "No location provided",
      image: "/images/default-event-image.png",
      perks: [],
      rsvps: [],
      pinned: false,
    },
    max: {
      name: 50,
      description: 100,
      location: 50,
      perks: 5,
      date: 50,
      perksInput: 59,
    },
    min: {
      name: 1,
      description: 1,
      location: 1,
      perks: 0,
      date: 1,
    },
  },
};

export default config;
