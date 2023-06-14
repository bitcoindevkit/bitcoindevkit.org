---
layout: ReviewClubLayout
title: BDK Weekly PR review club
---

### A fortnightly review club for BitcoinDevKit(BDK) PRs

<span class="question">What is this?</span> &nbsp;A fortnightly review club for BitcoinDevKit (BDK) PRs at **{{ $meetingTime }} on {{ $meetingDay }}s** in the #bdk-pr-reviews IRC channel on
<a :href="$meetingPlace">Libera.chat</a>.

<span class="question">What's it for?</span> &nbsp;To help newer contributors
learn about the BDK review process. The review club is *not* primarily
intended to help open PRs get merged.

<span class="question">Who should take part?</span> &nbsp;Anyone who wants to
learn about contributing to BDK. All are welcome to come and ask
questions!

<span class="question">How do I take part?</span> Just show up on IRC! See
[Attending your first PR Review Club](/review-club/your-first-meeting/) for more tips
on how to participate. To stay up to date on newly announced review clubs,
you can follow us on <a href="https://twitter.com/bitcoindevkit">Twitter</a>.

<span class="question">Who runs this?</span> &nbsp;Upcoming meetings are
scheduled by {{ "site.coordinator" }}.
The meetings are hosted by a variety of BDK contributors. See
some of our [previous hosts](/meetings-hosts/).

## Upcoming Meetings

<div class="meeting-list-container">
    <h2>Meetings</h2>
    <div class="meetings-container">
        <ul class="meeting-list">
            <template v-for="page in $site.pages">
                <li v-if="page.frontmatter.layout === 'ReviewClubMeetingLayout' && page.frontmatter.status != 'past'">
                    {{ page.frontmatter.date | formatDate }}
                    <span id="text-separator">»</span>
                        <a id="meeting-link" :href="page.path">#{{ page.frontmatter.pr.split("/").pop() }} {{ page.frontmatter.title }}</a>
                </li>
            </template>
        </ul>
    </div>
</div>

We're always looking for interesting PRs to discuss in the review club and for
volunteer hosts to lead the discussion:

- If there's a PR that you'd like to discuss in a future meeting, feel free to suggest it in the IRC channel.
- If you'd like to host a meeting, look at the [information for meeting
  hosts](/review-club/hosting/) and contact us on  [Discord](https://discord.gg/dstn4dQ).



## Recent Meetings

<div class="meeting-list-container">
    <h2>Meetings</h2>
    <div class="meetings-container">
        <ul class="meeting-list">
            <template v-for="page in this.$getLastFourMeetings($site.pages)">
                <li>
                    {{ page.frontmatter.date | formatDate }}
                    <span id="text-separator">»</span>
                        <a id="meeting-link" :href="page.path">#{{ page.frontmatter.pr.split("/").pop() }} {{ page.frontmatter.title }}</a>
                </li>
            </template>
        </ul>
    </div>
</div>

See all [meetings](/review-club/meetings/).

## Other Resources for New Contributors

- Read the [Contributing to BDK
  Guide](https://github.com/bitcoindevkit/bdk/blob/master/CONTRIBUTING.md). This
  will help you understand the process and some of the terminology we use in BDK.
- Look at the [Good First
  Issues](https://github.com/bitcoin/bitcoin/issues?q=is%3aissue+is%3aopen+label%3a%22good+first+issue%22)
  and [Up For
  Grabs](https://github.com/bitcoin/bitcoin/issues?utf8=%e2%9c%93&q=label%3a%22up+for+grabs%22)
  list.
- Brush up on your Rust. There are [many primers and reference manuals
  available](https://github.com/rust-unofficial/awesome-rust#resources) plus the [Book](https://doc.rust-lang.org/book/).
- There are some excellent blog posts on how to start contributing to Bitcoin:
    - [Contributing to Bitcoin (Daniela Brozzoni)](https://danielabrozzoni.com/posts/contributing_to_oss/)
    - [A Gentle Introduction to Bitcoin Core Development (Jimmy Song)](https://bitcointechtalk.com/a-gentle-introduction-to-bitcoin-core-development-fdc95eaee6b8)
    - [Contributing to Bitcoin Core - a Personal Account (John Newbery)](https://bitcointechtalk.com/contributing-to-bitcoin-core-a-personal-account-35f3a594340b)
    - [Onboarding to Bitcoin Core (Amiti Uttarwar)](https://medium.com/@amitiu/onboarding-to-bitcoin-core-7c1a83b20365)
    - [How to Review Pull Requests in Bitcoin Core (Jon Atack)](https://jonatack.github.io/articles/how-to-review-pull-requests-in-bitcoin-core)


