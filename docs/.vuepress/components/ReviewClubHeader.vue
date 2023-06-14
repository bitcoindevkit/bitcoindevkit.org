<template>
    <header>
        <div class="logo">
            <a href="/review-club">BitcoinDevKit PR Review Club</a>
        </div>
        <nav>
            |<span v-for="nav in navs">
            <a :href="nav.link" class="nav-link">
                {{ nav.name }}
            </a> |</span>
        </nav>
    </header>
</template>


<script>
export default {
    name: "ReviewClubHeader",
    data() {
        return {
            navs: [{name: "ReviewClub Home", link: "/review-club/"}, {name: "BitcoinDevKit Home", link: "/"}, {name: "Meetings", link: "/review-club/meetings/"}, {name: "Code of Conduct", link: "/review-club/code-of-conduct/"}, {name: "Hosting", link: "/review-club/hosting/"}],
        }
    }
}
</script>

<style scoped>
header {
    font-family: "Helvetica",sans-serif;
    line-height: 1.5;
}

.logo {
    text-decoration: none;
    font-weight: bold;
    font-size: 48px;
}

.logo a:link, .logo a:visited {
    color: #000;

}

a.nav-link {
    display: inline-block;
    margin-left: 5px;
    color: #0000f0;
    text-decoration: underline;
}

a.nav-link:visited {
    color: #551b8c;
}

a.nav-link:hover {
    color: #fcc603;
}
</style>