import Blockly from 'blockly';
import BlocklyStorage from "./blockly_storage";

const toolbox = `<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Miniscript" colour="#5ba55b">
    <block type="and"></block>
    <block type="or">
      <field name="A_weight">1</field>
      <field name="B_weight">1</field>
    </block>
    <block type="thresh">
      <field name="Threshold">1</field>
    </block>
    <block type="after">
      <field name="NAME">1</field>
    </block>
    <block type="pk"></block>
    <block type="adapter"></block>
    <block type="older">
      <field name="NAME">1</field>
    </block>
    <block type="alias_key">
      <field name="label">Alias</field>
      <field name="name">name</field>
    </block>
    <block type="existing_key">
      <field name="NAME">Existing Key</field>
      <field name="key">tpub, WIF, hex...</field>
    </block>
  </category>
  <category name="Examples" colour="#5b67a5">
    <block type="pk">
      <value name="pk">
        <block type="alias_key">
          <field name="label">Alias</field>
          <field name="name">Alice</field>
        </block>
      </value>
    </block>
    <block type="or">
      <field name="A_weight">1</field>
      <field name="B_weight">1</field>
      <statement name="A">
        <block type="pk">
          <value name="pk">
            <block type="alias_key">
              <field name="label">Alias</field>
              <field name="name">Alice</field>
            </block>
          </value>
        </block>
      </statement>
      <statement name="B">
        <block type="pk">
          <value name="pk">
            <block type="alias_key">
              <field name="label">Alias</field>
              <field name="name">Bob</field>
            </block>
          </value>
        </block>
      </statement>
    </block>
    <block type="or">
      <field name="A_weight">99</field>
      <field name="B_weight">1</field>
      <statement name="A">
        <block type="pk">
          <value name="pk">
            <block type="alias_key">
              <field name="label">Alias</field>
              <field name="name">KeyLikely</field>
            </block>
          </value>
        </block>
      </statement>
      <statement name="B">
        <block type="pk">
          <value name="pk">
            <block type="alias_key">
              <field name="label">Alias</field>
              <field name="name">Likely</field>
            </block>
          </value>
        </block>
      </statement>
    </block>
    <block type="and">
      <statement name="A">
        <block type="pk">
          <value name="pk">
            <block type="alias_key">
              <field name="label">Alias</field>
              <field name="name">User</field>
            </block>
          </value>
        </block>
      </statement>
      <statement name="B">
        <block type="or">
          <field name="A_weight">99</field>
          <field name="B_weight">1</field>
          <statement name="A">
            <block type="pk">
              <value name="pk">
                <block type="alias_key">
                  <field name="label">Alias</field>
                  <field name="name">Service</field>
                </block>
              </value>
            </block>
          </statement>
          <statement name="B">
            <block type="older">
              <field name="NAME">12960</field>
            </block>
          </statement>
        </block>
      </statement>
    </block>
    <block type="thresh">
      <field name="Threshold">3</field>
      <statement name="A">
        <block type="adapter">
          <statement name="NAME">
            <block type="pk">
              <value name="pk">
                <block type="alias_key">
                  <field name="label">Alias</field>
                  <field name="name">Alice</field>
                </block>
              </value>
            </block>
          </statement>
          <next>
            <block type="adapter">
              <statement name="NAME">
                <block type="pk">
                  <value name="pk">
                    <block type="alias_key">
                      <field name="label">Alias</field>
                      <field name="name">Bob</field>
                    </block>
                  </value>
                </block>
              </statement>
              <next>
                <block type="adapter">
                  <statement name="NAME">
                    <block type="pk">
                      <value name="pk">
                        <block type="alias_key">
                          <field name="label">Alias</field>
                          <field name="name">Carol</field>
                        </block>
                      </value>
                    </block>
                  </statement>
                  <next>
                    <block type="adapter">
                      <statement name="NAME">
                        <block type="older">
                          <field name="NAME">12960</field>
                        </block>
                      </statement>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </statement>
    </block>
  </category>
</xml>`;

export function startBlockly(container, codeContainer) {
    console.log('Blockly starting');

    const codeContainerObj = document.getElementById(codeContainer);

    Blockly.JavaScript.INDENT = '';

    var options = { 
            toolbox : toolbox, 
            collapse : true, 
            comments : true, 
            disable : true, 
            maxBlocks : Infinity, 
            trashcan : true, 
            horizontalLayout : true, 
            toolboxPosition : 'start', 
            css : true, 
            media : 'https://blockly-demo.appspot.com/static/media/', 
            rtl : false, 
            scrollbars : true, 
            sounds : true, 
            oneBasedIndex : true, 
            grid : {
                    spacing : 20, 
                    length : 1, 
                    colour : '#888', 
                    snap : true
            }
    };

    Blockly.Blocks['pk'] = {
      init: function() {
        this.appendValueInput("pk")
            .setCheck("key")
            .appendField("Key");
        this.setPreviousStatement(true, "policy");
        this.setColour(260);
     this.setTooltip("Requires a signature with a given public key");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['begin'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Begin");
        this.setNextStatement(true, "policy");
        this.setColour(160);
     this.setTooltip("Sets the beginning of the policy");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['existing_key'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable("Existing Key"), "NAME")
            .appendField(new Blockly.FieldTextInput("tpub, WIF, hex..."), "key");
        this.setOutput(true, "key");
        this.setColour(120);
     this.setTooltip("Sets the value of a key to an existing WIF key, xpub or hex public key");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['alias_key'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable("Alias"), "label")
            .appendField(new Blockly.FieldTextInput("name"), "name")
        this.setOutput(true, "key");
        this.setColour(120);
     this.setTooltip("Sets the value of a key to an alias");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['thresh'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Threshold")
            .appendField(new Blockly.FieldNumber(1, 1, Infinity, 1), "Threshold");
        this.appendStatementInput("A")
            .setCheck("thresh")
            .appendField("Policies");
        this.setPreviousStatement(true, "policy");
        this.setColour(230);
     this.setTooltip("Creates a threshold element (m-of-n), where the 'm' field is manually set and 'n' is implied by the number of sub-policies added. Requies all of its children to be wrapped in the 'Entry' block");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['older'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Older")
            .appendField(new Blockly.FieldNumber(1, 1, Infinity, 1), "NAME");
        this.setPreviousStatement(true, "policy");
        this.setColour(20);
     this.setTooltip("Requires waiting a number of blocks from the confirmation height of a UTXO before it becomes spendable");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['after'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("After")
            .appendField(new Blockly.FieldNumber(1, 1, Infinity, 1), "NAME");
        this.setPreviousStatement(true, "policy");
        this.setColour(20);
     this.setTooltip("Requires the blockchain to reach a specific block height before the UTXO becomes spendable");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['adapter'] = {
      init: function() {
        this.appendStatementInput("NAME")
            .setCheck("policy")
            .appendField("Entry");
        this.setPreviousStatement(true, "thresh");
        this.setNextStatement(true, "thresh");
        this.setColour(290);
     this.setTooltip("Adapter used to stack policies into 'Threshold' blocks");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['and'] = {
      init: function() {
        this.appendStatementInput("A")
            .setCheck("policy");
        this.appendDummyInput()
            .appendField("AND");
        this.appendStatementInput("B")
            .setCheck("policy");
        this.setPreviousStatement(true, "policy");
        this.setColour(230);
     this.setTooltip("Requires both sub-policies to be satisfied");
     this.setHelpUrl("");
      }
    };

    Blockly.Blocks['or'] = {
      init: function() {
        this.appendStatementInput("A")
            .setCheck("policy")
            .appendField("Weight")
            .appendField(new Blockly.FieldNumber(1, 1), "A_weight");
        this.appendDummyInput()
            .appendField("OR");
        this.appendStatementInput("B")
            .setCheck("policy")
            .appendField("Weight")
            .appendField(new Blockly.FieldNumber(1, 1), "B_weight");
        this.setPreviousStatement(true, "policy");
        this.setColour(230);
     this.setTooltip("Requires either one of the two sub-policies to be satisfied. Weights can be used to indicate the relative probability of each sub-policy");
     this.setHelpUrl("");
      }
    };

    Blockly.JavaScript['begin'] = function(block) {
      return '';
    };

    Blockly.JavaScript['pk'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

      var value_pk = Blockly.JavaScript.valueToCode(block, 'pk', Blockly.JavaScript.ORDER_ATOMIC);
        if (value_pk == '') {
            value_pk = '()';
        }

      var code = 'pk' + value_pk;
      return code;
    };

    Blockly.JavaScript['existing_key'] = function(block) {
        if (!block.getParent()) {
            return ['', Blockly.JavaScript.ORDER_NONE];
        }

      var text_key = block.getFieldValue('key');
      var code = text_key;
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    };

    Blockly.JavaScript['alias_key'] = function(block) {
        if (!block.getParent()) {
            return ['', Blockly.JavaScript.ORDER_NONE];
        }

      var text_name = block.getFieldValue('name');

      var code = text_name;
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_NONE];
    };

    Blockly.JavaScript['thresh'] = function(block) {
      var number_threshold = block.getFieldValue('Threshold');
      var statements_a = Blockly.JavaScript.statementToCode(block, 'A');
      var code = 'thresh(' + number_threshold + ',' + statements_a + ')';
      return code;
    };

    Blockly.JavaScript['older'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

      var number_name = block.getFieldValue('NAME');
      var code = 'older(' + number_name + ')';
      return code;
    };

    Blockly.JavaScript['after'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

      var number_name = block.getFieldValue('NAME');
      // TODO: Assemble JavaScript into code variable.
      var code = 'after(' + number_name + ')';
      return code;
    };

    Blockly.JavaScript['adapter'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

        return Blockly.JavaScript.statementToCode(block, 'NAME') + (block.getNextBlock() ? ',' : '');
    };

    Blockly.JavaScript['and'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

      var statements_a = Blockly.JavaScript.statementToCode(block, 'A');
      var statements_b = Blockly.JavaScript.statementToCode(block, 'B');
      var code = 'and(' + statements_a + ',' + statements_b + ')';
      return code;
    };

    Blockly.JavaScript['or'] = function(block) {
        if (!block.getParent()) {
            return '';
        }

      var number_a_weight = block.getFieldValue('A_weight');
        if (number_a_weight == '1') {
            number_a_weight = '';
        } else {
            number_a_weight = number_a_weight + '@';
        }
      var statements_a = Blockly.JavaScript.statementToCode(block, 'A');
      var number_b_weight = block.getFieldValue('B_weight');
        if (number_b_weight == '1') {
            number_b_weight = '';
        } else {
            number_b_weight = number_b_weight + '@';
        }
      var statements_b = Blockly.JavaScript.statementToCode(block, 'B');
      var code = 'or(' + number_a_weight + statements_a + ',' + number_b_weight + statements_b + ')';
      return code;
    };

    /* Inject your workspace */ 
    var workspace = Blockly.inject(container, options);
    function myUpdateFunction(event) {
      codeContainerObj.value = Blockly.JavaScript.workspaceToCode(workspace);
    }
    workspace.addChangeListener(myUpdateFunction);

    workspace.addChangeListener(Blockly.Events.disableOrphans);

    setTimeout(() => {
        BlocklyStorage.restoreBlocks();
        if (workspace.getTopBlocks().length == 0) {
            var beginBlock = workspace.newBlock('begin');
            beginBlock.setDeletable(false);
            beginBlock.setEditable(false);
            beginBlock.moveBy(20, 20);
            beginBlock.initSvg();
            beginBlock.render();
        }

        // add fullscreen button
        const btn = document.createElement("span");
        btn.innerHTML = '<i class="fas fa-expand"></i>';
        btn.style['float'] = 'right';
        btn.style['margin-right'] = '10px';

        let fs = false;
        btn.onclick = function() {
            if (fs) {
                document.exitFullscreen();
            } else {
                document.getElementById("blocklyDiv").requestFullscreen();
            }

            fs = !fs;
        };

        document.getElementsByClassName("blocklyToolboxDiv")[0].appendChild(btn);
    }, 0);

    BlocklyStorage.backupOnUnload();
}
