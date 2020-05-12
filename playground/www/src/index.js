import { WalletWrapper, init, compile } from "magical-bitcoin-wallet-playground";
import * as InternalBlockly from "./blockly.js";

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
    InternalBlockly.startBlockly('blocklyDiv', 'policy');

    let currentWallet = null;

    document.getElementById("stdin").disabled = true;

    const start_button = document.getElementById("start_button");
    const stop_button = document.getElementById("stop_button");
    const start_message = document.getElementById("start_message");

    start_button.disabled = false;
    stop_button.disabled = true;

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

                currentWallet = w;
                stop_button.disabled = false;
            })
            .catch((err) => start_message.innerHTML = `<span class="error">${err}</span>`);
    };

    stop_button.onclick = (e) => {
        if (currentWallet == null) {
            return;
        }

        e.preventDefault();

        currentWallet.free();
        start_message.innerHTML = "Wallet instance destroyed";

        start_button.disabled = false;
        stop_button.disabled = true;

        descriptor.disabled = false;
        change_descriptor.disabled = false;
    };

    const policy = document.getElementById('policy');
    const compiler_script_type = document.getElementById('compiler_script_type');
    const compiler_output = document.getElementById('compiler_output');
    const compile_button = document.getElementById('compile_button');
    compile_button.onclick = (e) => {
        if (policy.value.length == 0) {
            return;
        }

        e.preventDefault();

        const single = !e.target.form.elements.namedItem('alias').length;

        let elements_alias = e.target.form.elements.namedItem('alias');
        let elements_type = e.target.form.elements.namedItem('type');
        let elements_extra = e.target.form.elements.namedItem('extra');

        if (single) {
            elements_alias = [elements_alias];
            elements_type = [elements_type];
            elements_extra = [elements_extra];
        } else {
            elements_alias = Array.from(elements_alias);
            elements_type = Array.from(elements_type);
            elements_extra = Array.from(elements_extra);
        }

        const aliases = {};
        elements_alias.forEach((alias) => {
            const type = elements_type.filter((x) => x.attributes["data-index"].value == alias.attributes["data-index"].value)[0].value;
            const extra = elements_extra.filter((x) => x.attributes["data-index"].value == alias.attributes["data-index"].value)[0].value;
            const aliasValue = alias.value;

            aliases[aliasValue] = { type, extra };
        });

        compile(policy.value, JSON.stringify(aliases), compiler_script_type.value)
            .then(res => compiler_output.innerHTML = res)
            .catch(err => compiler_output.innerHTML = `<span class="error">${err}</span>`);
    }
})();
