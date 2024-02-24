const config = {
  event: {
    calendarUrl: "",
    suggestionUrl: "",
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
