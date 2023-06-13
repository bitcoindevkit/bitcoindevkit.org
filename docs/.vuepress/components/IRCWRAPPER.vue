<template>
  <div class="irc-logs" v-html="logs"></div>
</template>

<script>
import he from 'he';

export default {
  name: 'IRCWRAPPER',
  data() {
    return {
      logs: "",
    }
  },  
  methods: {
    parseLogs(content) {

      const URI_SCHEMES = ['http', 'https'];
      const TRAILING = /[^\/[:^punct:]]+$/;
      const HH_MM = /^([0-1][0-9]|[2][0-3]):[0-5][0-9] .*/;
      const IRC_NICK = /^(?:\s*)(<.+?>)/;
      const LT_GT = /[<>]/g;
      const LINE_DIGITS = 3;
      const TIME_SIZE = 'HH:MM'.length;
      const TIME_SIZE_PLUS_1 = TIME_SIZE + 1;
      const NON_BREAKING_SPACE = '&nbsp;';
      const COLORS = ['brown', 'goldenrod', 'cadetblue', 'chocolate', 'cornflowerblue', 'coral', 'crimson', 'forestgreen', 'darkblue', 'firebrick', 'blue', 'green', 'grey', 'hotpink', 'indianred', 'indigo', 'blueviolet', 'maroon', 'mediumblue', 'mediumpurple', 'mediumseagreen', 'navy', 'fuchsia', 'olive', 'orchid', 'purple', 'red', 'seagreen', 'sienna', 'orange', 'slateblue', 'peru', 'salmon', 'teal', 'magenta', 'steelblue', 'rebeccapurple', 'tomato', 'violet', 'darkcyan'];
      const NUM_COLORS = COLORS.length;

      let lines = content.split("\n");
      let outputHtml = "";
      let colors = {};
      let colorIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if ( lines[i].length == 0 ) {
          break;
        }
        const lineno = `${NON_BREAKING_SPACE.repeat(LINE_DIGITS - i.toString().length)}${i}`;
        const time = lines[i].slice(0, TIME_SIZE);
        const nameMatch = lines[i].slice(TIME_SIZE_PLUS_1).match(IRC_NICK);
        const name = nameMatch ? nameMatch[0] : '';
        let nick = name.replaceAll(LT_GT, '').trim();
        const color = colors[nick] || ((colorIndex += 1) % NUM_COLORS, colors[nick] = COLORS[colorIndex]);
        nick = nick === '' ? nick : `&lt;${nick}&gt;`;
        let message = he.escape(lines[i].slice(TIME_SIZE_PLUS_1 + name.length));
  
        let urls = message.match(URI_SCHEMES);
        if (urls != null) {
          urls.forEach((uri) => {
            const link = uri.replace(TRAILING, '');
            message = message.replace(link, `<a href='${link}' target='blank'>${link}</a>`);
          });
        }
  
        outputHtml += `<table class='log-line' id='l-${i}'>
                  <tr class='log-row'>
                    <td class='log-lineno'><a class="lineno" href='#l-${i}'>${lineno}</a></td>
                    <td class='log-time'>${time}</td>
                    <td>
                      <span class='log-nick' style='color:${color}'>${nick}</span>
                      <span class='log-msg'>${message}</span>
                    </td>
                  </tr>
                </table>`;
      }

      return outputHtml;

    }
  },
  mounted() {
    let content = this.$slots.default[0].children[0].text;
    let parsedLogs = this.parseLogs(content);
    this.logs = parsedLogs;
  }
};
</script>

<style>
.log-time{
  color: #0000f0;
  padding-left: 6px;
  padding-right: 6px;
}

.log-nick {
  font-weight: bold;
  color: green;
}

.log-msg {
  padding-left: 0px;
  white-space: pre-wrap;
}

.log-line {
  margin-block-start: 0px;
  margin-block-end: 0px;
  font-family: monospace;
  border-spacing: 0px;
}
  
.log-row {
  vertical-align: top;
}

td.log-lineno {
  background-color: #f0f0f0;
}

th, td {
  border: none;
  padding: 0px;
}

table.log-line {
  border-collapse: separate;
}

a.lineno {
  text-decoration: none;
}
  
</style>