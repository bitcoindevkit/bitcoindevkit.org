---
layout: ReviewClubLayout
title: Meeting Notes
---

<div class="meeting-list-container">
    <h2>Meetings</h2>
    <div class="meetings-container">
        <ul class="meeting-list">
            <template v-for="page in $site.pages">
                <li v-if="page.frontmatter.layout === 'ReviewClubMeetingLayout'">
                    {{ page.frontmatter.date | formatDate }}
                    <span id="text-separator">»</span>
                        <a id="meeting-link" :href="page.path">#{{ page.frontmatter.pr.split("/").pop() }} {{ page.frontmatter.title }}</a>
                </li>
            </template>
        </ul>
    </div>
</div>
