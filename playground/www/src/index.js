import { WalletWrapper, init } from "wasm-esplora";

async function startWallet(desc, change_desc) {
    const stdout = document.getElementById("stdout");
    const stdin = document.getElementById("stdin");

    stdin.disabled = false;

    const history = [];
    let historyIndex = 0;

    const inst = await new WalletWrapper("testnet", desc, change_desc, "https://blockstream.info/testnet/");

    const run = (command) => {
        if (command == "clear") {
            stdout.innerHTML = '';
            return;
        }

        stdin.disabled = true;

        if (stdout.innerHTML.length > 0) {
            stdout.innerHTML += '\n';
        }

        stdout.innerHTML += `<span class="command">> ${command}</span>\n`;
        historyIndex = history.push(command);

        return inst
            .run(command)
            .then(success => {
                if (success) {
                    stdout.innerHTML += `<span class="success">${success}</span>\n`;
                }
            })
            .catch(err => stdout.innerHTML += `<span class="error">${err}</span>\n`)
            .finally(() => {
                stdin.disabled = false;

                stdout.scrollTop = stdout.scrollHeight - stdout.clientHeight;
            })
    };

    stdin.onkeydown = (e) => {
        if (e.key == "Enter") {
            if (stdin.value.length == 0) {
                return;
            }

            run(stdin.value);
            stdin.value = "";

            e.preventDefault();
        } else if (e.key == "ArrowUp") {
            if (historyIndex > 0) {
                stdin.value = history[--historyIndex];
            }
        } else if (e.key == "ArrowDown") {
            if (historyIndex < history.length) {
                stdin.value = history[++historyIndex] || "";
            }
        }
    };

    return {
        run
    };
}

(async function() {
    init();

    document.getElementById("stdin").disabled = true;

    const start_button = document.getElementById("start_button");
    const start_message = document.getElementById("start_message");

    start_button.disabled = false;

    const descriptor = document.getElementById("descriptor"); 
    const change_descriptor = document.getElementById("change_descriptor"); 

    start_button.onclick = (e) => {
        if (descriptor.value.length == 0) {
            return;
        }

        e.preventDefault();

        startWallet(descriptor.value, change_descriptor.value.length > 0 ? change_descriptor.value : null)
            .then((w) => {
                start_button.disabled = true;
                descriptor.disabled = true;
                change_descriptor.disabled = true;

                start_message.innerHTML = "Wallet created, running `sync`...";

                w.run('sync').then(() => start_message.innerHTML = "Ready!");
            })
            .catch((err) => start_message.innerHTML = `<span class="error">${err}</span>`);
    };
})();
