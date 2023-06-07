<template>
  <div class="container">
    <div class="header-container">
      <ReviewClubHeader />
    </div>
    <div class="body-container">
      <Content/>
    </div>
  </div>
</template>

<script>
import ReviewClubHeader from "./ReviewClubHeader.vue";

export default {
  data() {
    return {

    }
  },
  components: {
    ReviewClubHeader
  }
}
</script>

<style>
.body-container {
  color: #000;
  box-sizing: border-box;
  display: flex;
  margin-left: 10%;
  margin-right: 10%;
  font-family: "Helvetica",sans-serif;
  line-height: 1.5;
}

.header-container {
  color: #000;
  box-sizing: border-box;
  display: flex;
  margin-left: 10%;
  margin-right: 10%;
  font-family: "Helvetica",sans-serif;
  line-height: 1.5;
}

.body-container .question {
  font-weight: bold;
  
}

.body-container a:link {
  color: #0000f0;
}

.body-container a:visited {
  color: #551b8c;
}

.body-container a {
  text-decoration: underline;
}
</style>