const config = {
  event: {
    calendarUrl:
      "https://calendar.google.com/calendar/u/0?cid=MmJkMGJjNmY3NDU4OTIyNDUzOWYxMGZiMTQxYjgwOWUyYjJhZTA4NjNlNTAwMjI1ODY4ZTNlNjc2MjBjZjY3N0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
    suggestionUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfSPXRG02mReQ0XXx82Qyl2hubR32LiGUrgOu848EB-jwiCQg/viewform?usp=sf_link",
    planningQuestionaireUrl: "",
    sermEventUrl: "",
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
