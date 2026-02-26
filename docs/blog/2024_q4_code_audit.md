# 2024 Q4 Code Audit

:lucide-pen-tool: &nbsp; [`Steve Myers`]()  
:lucide-calendar-1: &nbsp; `Dec 3, 2024`
---

A heartfelt thank you to our friends at [Spiral](https://spiral.xyz/) for sponsoring a code audit of the current `bdk` 1.0.0-beta Rust codebase. The effort was led by [Antoine Poinsot](https://github.com/darosior) from [Wizardsardine](https://wizardsardine.com/), who did a fantastic job providing insightful and actionable recommendations for the BDK team. You can find the full report [here](https://gist.github.com/darosior/4aeb9512d7f1ac7666abc317d6f9453b).

As outlined in Antoine's report, the audit's primary focus was to review the core components that constitute a BDK-based wallet, particularly the new methods for managing and synchronizing chain data. The audit scope included some reasonable simplifying assumptions, such as trusting that the Electrum or Esplora servers to which BDK wallets connect are not malicious. However, Antoine went above and beyond and also recommended a few simple fixes we can do to guard against certain types of bad server behavior.

While no critical defects were identified, a potential denial of service/performance issue was uncovered, along with opportunities to improve the code's fault tolerance and API documentation. The team is currently addressing the performance issue, as well as some of the more straightforward recommendations. All suggested improvements have been [added to our issues backlog](https://github.com/bitcoindevkit/bdk/issues?q=is%3Aissue+label%3Aaudit) for future releases.

If you are a user or potential user of BDK, or a Bitcoin Rust developer, we would love to hear your feedback. Please reach out on the [BDK Discord](https://discord.gg/dstn4dQ) or comment on individual [GitHub issues](https://github.com/bitcoindevkit/bdk/issues?q=is%3Aissue+is%3Aopen). As a fully free and open-source project, the BDK team relies on YOU our community of users and contributors to help us deliver the best Bitcoin wallet library possible.