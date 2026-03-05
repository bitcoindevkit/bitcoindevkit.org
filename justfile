[doc("List all available commands.")]
@list:
  just --list --unsorted

[doc("Open repository on GitHub.")]
repo:
  open https://github.com/bitcoindevkit/bitcoindevkit.org

[group("Develop")]
[doc("Serve the site locally.")]
serve:
  uv run zensical serve
