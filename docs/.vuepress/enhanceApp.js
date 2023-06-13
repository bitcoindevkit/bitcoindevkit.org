export default ({ Vue }) => {
    Vue.filter('formatDate', dateString => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    });

    // Create a mixin
    const customPropertyMixin = {
        created() {
            this.$meetingTime = "15:00 UTC";
            this.$meetingDay = "Thursday";
            this.$meetingPlace = "";
        },
    };
  
    // Apply the mixin globally
    Vue.mixin(customPropertyMixin);

    // Create a mixin
    const customMethodMixin = {
        methods: {
            $getLastFourMeetings(pages) {
                let pastMeetings = pages.filter(page => page.frontmatter.status === 'past' && page.frontmatter.layout === 'ReviewClubMeetingLayout');
                pastMeetings.sort((a, b) => {
                    const dateA = new Date(a.frontmatter.date);
                    const dateB = new Date(b.frontmatter.date);
                    return dateB - dateA;
                });
                return pastMeetings.length > 4? pastMeetings.slice(0, 4) : pastMeetings;
            },
        },
    };
  
    // Apply the mixin globally
    Vue.mixin(customMethodMixin);

};