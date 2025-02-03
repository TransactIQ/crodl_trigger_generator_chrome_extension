// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Function to clear output
    function clearOutput() {
        document.getElementById('output').value = '';
    }

    // Add event listeners for input changes
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', clearOutput);
    });

    // Handle TP type changes
    document.getElementById('tpType').addEventListener('change', function() {
        const tpType = this.value;
        const tpValueGroup = document.getElementById('tpValueGroup');
        if (tpType === 'price') {
            tpValueGroup.classList.add('hidden');
            document.getElementById('tpValue').removeAttribute('required');
        } else {
            tpValueGroup.classList.remove('hidden');
            document.getElementById('tpValue').setAttribute('required', 'required');
        }
    });

    // Handle SL type changes
    document.getElementById('slType').addEventListener('change', function() {
        const slType = this.value;
        const slValueGroup = document.getElementById('slValueGroup');
        if (slType === 'price') {
            slValueGroup.classList.add('hidden');
            document.getElementById('slValue').removeAttribute('required');
        } else {
            slValueGroup.classList.remove('hidden');
            document.getElementById('slValue').setAttribute('required', 'required');
        }
    });


    // Handle quantity type changes
    document.getElementById('triggerQuantityType').addEventListener('change', function() {
        const quantityType = this.value;
        const quantityValue = document.getElementById('triggerQuantityValue');
        const quantityGroup = document.getElementById('quantityValueGroup');

        if (quantityType === 'assetIndicator') {
            quantityGroup.classList.add('hidden');
            quantityValue.removeAttribute('required');
        } else {
            quantityGroup.classList.remove('hidden');
            quantityValue.setAttribute('required', 'required');
        }
    });

    // Handle indicator changes
    document.getElementById('indicator').addEventListener('change', function() {
        const indicator = this.value;
        const quantityType = document.getElementById('triggerQuantityType');
        const assetIndicatorOption = quantityType.querySelector('option[value="assetIndicator"]');

        if (indicator === 'reversal' || indicator === 'counterstrike') {
            assetIndicatorOption.style.display = 'block';
        } else {
            if (quantityType.value === 'assetIndicator') {
                quantityType.value = 'asset';
                document.getElementById('triggerQuantityValue').value = '';
            }
            assetIndicatorOption.style.display = 'none';
        }
    });

    // Generate trigger
    document.getElementById('generate').addEventListener('click', function() {
        const getPlotValues = (indicator, side) => {
            switch (indicator) {
                case "impulse":
                    return {
                        entry: side === "buy" ? '{{plot("[Automation] Long Entry Price")}}' : '{{plot("[Automation] Short Entry Price")}}',
                        sl: side === "buy" ? '{{plot("[Automation] Initial Stop And Trailing Stop Price Long")}}' : '{{plot("[Automation] Initial Stop And Trailing Stop Price Short")}}',
                        tp: side === "buy" ? '{{plot("[Automation] RR Profit Target Long (Optional)")}}' : '{{plot("[Automation] RR Profit Target Short (Optional)")}}',
                        proposed: side === "buy" ? '{{plot("Ideal Amount Long Position")}}' : '{{plot("Ideal Amount Short Position")}}',
                    };
                case "novareversion":
                    return {
                        entry: side === "buy" ? '{{plot("[Automation Reversion] Long Entry Price")}}' : '{{plot("[Automation Reversion] Short Entry Price")}}',
                        sl: side === "buy" ? '{{plot("[Automation Reversion] Long SL Price")}}' : '{{plot("[Automation Reversion] Short SL Price")}}',
                        tp: side === "buy" ? '{{plot("[Automation Reversion] Long TP Price")}}' : '{{plot("[Automation Reversion] Short TP Price")}}',
                        proposed: side === "buy" ? '{{plot("Ideal Amount Long Position (Reversion)")}}' : '{{plot("Ideal Amount Short Position (Reversion)")}}',
                    };
                case "novatrend":
                    return {
                        entry: '{{plot("[Automation Trend] Entry Price")}}',
                        sl: '{{plot("[Automation Trend] SL Price")}}',
                        tp: '{{plot("[Automation Trend] TP Price")}}',
                        proposed: '{{plot("Ideal Amount Long Or Short Position (Trend)")}}',
                    };
                case "reversal":
                    return {
                        entry: side === "buy" ? '{{plot("[Automation] Long Limit Order Price")}}' : '{{plot("[Automation] Short Limit Order Price")}}',
                        sl: side === "buy" ? '{{plot("[Automation] Long Position SL")}}' : '{{plot("[Automation] Short Position SL")}}',
                        tp: side === "buy" ? '{{plot("[Automation] Long Position TP1")}}' : '{{plot("[Automation] Short Position TP1")}}',
                        proposed: side === "buy" ? '{{plot("Ideal Amount Long Position")}}' : '{{plot("Ideal Amount Short Position")}}',
                    };
                case "counterstrike":
                    return {
                        entry: side === "buy" ? '{{plot("[Automation] Long Entry Price")}}' : '{{plot("[Automation] Short Entry Price")}}',
                        sl: side === "buy" ? '{{plot("[Automation] Long Initial Stop Price")}}' : '{{plot("[Automation] Short Initial Stop Price")}}',
                        tp: side === "buy" ? '{{plot("[Automation] Long TP1 Price")}}' : '{{plot("[Automation] Short TP1 Price")}}',
                        proposed: side === "buy" ? '{{plot("Ideal Amount Long Position")}}' : '{{plot("Ideal Amount Short Position")}}',
                    };
                default:
                    throw new Error("Invalid indicator");
            }
        };

        const values = {
            triggerId: document.getElementById('triggerId').value.trim(),
            indicator: document.getElementById('indicator').value,
            side: document.getElementById('side').value,
            entryMode: document.getElementById('entryMode').value,
            triggerQuantityValue: document.getElementById('triggerQuantityValue').value,
            triggerQuantityType: document.getElementById('triggerQuantityType').value,
            leverageValue: document.getElementById('leverageValue').value,
            leverageType: document.getElementById('leverageType').value,
            tpType: document.getElementById('tpType').value,
            tpValue: document.getElementById('tpValue').value,
            slType: document.getElementById('slType').value,
            slValue: document.getElementById('slValue').value,
            oppositeClose: document.getElementById('oppositeClose').checked,
        };

        // Validate required fields
        if (!values.triggerId ||
            (values.triggerQuantityType !== 'assetIndicator' && !values.triggerQuantityValue) ||
            !values.leverageValue ||
            (values.tpType !== 'price' && !values.tpValue) ||
            (values.slType !== 'price' && !values.slValue)) {
            document.getElementById('output').value = 'Please fill out all required fields.';
            return;
        }

        const plots = getPlotValues(values.indicator, values.side);

        // Generate the trigger JSON
        let trigger = {
            trigger_id: values.triggerId,
            trigger_quantity_value: values.triggerQuantityType === 'assetIndicator' ? plots.proposed : parseFloat(values.triggerQuantityValue),
            trigger_quantity_type: values.triggerQuantityType === 'assetIndicator' ? 'asset' : values.triggerQuantityType,
            trigger_order_type: values.entryMode,
            trigger_leverage_type: "isolated",
            trigger_leverage_value: parseFloat(values.leverageValue),
            trigger_tp_type: values.tpType,
            trigger_tp_value: values.tpType === 'price' ? plots.tp : parseFloat(values.tpValue),
            trigger_sl_type: values.slType,
            trigger_sl_value: values.slType === 'price' ? plots.sl : parseFloat(values.slValue),
            trigger_opposite_close: values.oppositeClose
        };

        // Add limit price if entry mode is limit
        if (values.entryMode === 'limit') {
            trigger = {
                trigger_limit_price: plots.entry,
                trigger_cancel_unfilled: true,
                ...trigger
            };
        }

        // Format and display the output
        document.getElementById('output').value = JSON.stringify(trigger, null, 4);
    });

    // Copy to clipboard functionality
    document.getElementById('copy').addEventListener('click', function() {
        const output = document.getElementById('output');
        output.select();
        document.execCommand('copy');
    });

    // Save form values to storage
    function saveFormValues() {
        const formData = {
            indicator: document.getElementById('indicator').value,
            triggerId: document.getElementById('triggerId').value,
            side: document.getElementById('side').value,
            entryMode: document.getElementById('entryMode').value,
            triggerQuantityType: document.getElementById('triggerQuantityType').value,
            triggerQuantityValue: document.getElementById('triggerQuantityValue').value,
            leverageType: document.getElementById('leverageType').value,
            leverageValue: document.getElementById('leverageValue').value,
            tpType: document.getElementById('tpType').value,
            tpValue: document.getElementById('tpValue').value,
            slType: document.getElementById('slType').value,
            slValue: document.getElementById('slValue').value,
            oppositeClose: document.getElementById('oppositeClose').checked,
        };
        chrome.storage.local.set({ formData });
    }

    // Load saved form values
    function loadFormValues() {
        chrome.storage.local.get('formData', function(result) {
            if (result.formData) {
                Object.entries(result.formData).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value;
                        }
                    }
                });
            }
        });
    }

    // Add event listeners for saving form values
    const formElements = document.querySelectorAll('input, select');
    formElements.forEach(element => {
        element.addEventListener('change', saveFormValues);
    });

    // Load saved values when popup opens
    loadFormValues();
});