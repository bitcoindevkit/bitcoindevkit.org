<template>
    <div class="meeting-header">
        <p class="date">{{ date| formatDate }}</p>
        <p class="pr"><a :href="pr">{{ pr }}</a></p>
        <div class="people-container">
            <span class="host">Host: {{ host }} <a :href="`https://github.com/${host}`"><i class="fab fa-github"></i></a></span> -
            <span class="authors">PR Authors: <span class="author" v-for="author in authors">{{ author }} <a :href="`https://github.com/${author}`"><i class="fab fa-github"></i></a></span></span>
        </div>
        <p>The PR branch HEAD was <a :href="commitLink">{{ commit }}</a> at the time of this review club meeting.</p>
    </div>
</template>


<script>
export default {
    name: "ReviewClubMeetingHeader",
    props: {
        host: String,
        authors: Array,
        pr: String,
        date: String,
        commit: String,
        commitLink: String
    },

}
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
</style>