import {
	html, css, KaspaDialog, askForPassword, KAS,
	formatForMachine, formatForHuman
} from './kaspa-dialog.js';
const pass = "";

class KaspaReceiveDialogMobile extends KaspaDialog{
	static get properties(){
		return {
			address:{type:String},
			amount:{type:String}
		}
	}
	static get styles(){
		return [KaspaDialog.styles, 
		css`
			.container{
				border-radius:0px;width:100%;height:100%;border:0px;
				padding:0px;
				max-height:none;
				--flow-input-label-font-size: 0.9rem;
				--flow-input-label-padding: 5px 7px;
				--flow-input-font-family:'Exo 2', Consolas;
				--flow-input-font-size:1rem;
				--flow-input-font-weight: normal;
				--flow-input-height:50px;
				--flow-input-margin: 20px 0px;
				--flow-input-padding: 10px 10px 10px 16px;
			
			}
			.address-option-btns{
				width:90%;max-width:450px;margin:auto;
				display:flex;flex-wrap:wrap;flex-direction:column;
				justify-content:center; align-items:center;
			}
			label{font-size:0.9rem;margin:5px;display:block}
			.address-option-btns flow-btn{flex:1;max-width:120px;min-width:120px;margin:5px}
			.buttons{justify-content:flex-end;align-items:center}
			.spinner{margin-right:20px}
			.estimate-tx-error{color:red}
			.estimate-tx span{display:block}	
			flow-checkbox{width:100%;margin:15px 0px;}
			[col] { display:flex; flex-direction: row;flex-wrap:wrap }
			[spacer] { min-width: 32px; }
			[flex] { flex:1; }
			flow-input{min-width:100px;}
			flow-input.amount,
			flow-input.fee{flex:1}
			flow-checkbox{margin:8px 0px;}
			.body-box{align-items:flex-start;}
			.center-button{
				margin:5px auto;display:block;max-width:120px;
			}
			@media (max-width:400px){
				[spacer] { min-width: 100%; }
			}
		`]
	}
	renderHeading(){
		return html`${this.renderBackBtn()} RECEIVE`;
	}
	renderBody(){
		let {amount='', address=''} = this;
		let amountStr = amount?'?amount='+amount:'';
		return html`
			<flow-qrcode data="${address+amountStr}"></flow-qrcode>
			<flow-input class="address full-width" suffix-btn
				label="Address and amount" readonly value="${address+amountStr}">
				<flow-btn slot="suffix" class="primary"
					@click="${this.copyAddress}"><fa-icon icon="copy"></fa-icon></flow-btn>
			</flow-input>
			<flow-input class="amount full-width" suffix-btn
				label="Amount in KAS" @keyup=${this.onAmountChange}
				value="${this.amount}">
				<flow-btn slot="suffix" class="primary"
					@click="${this.showT9}"><fa-icon icon="keyboard"></fa-icon></flow-btn>
			</flow-input>
			<div class="error">${this.errorMessage}</div>
			<flow-btn primary class="center-button"	@click="${this.hide}">
				DONE
			</flow-btn>
			`;
	}
	open(args, callback){
		this.callback = callback;
		this.args = args;
		this.wallet = args.wallet;
		this.address = args.address||"";
		this.amount = args.amount||"";
		this.show();
	}
	copyAddress(){
		let input = this.renderRoot.querySelector(".address").renderRoot.querySelector("input");
		input.select();
		input.setSelectionRange(0, 99999)
		document.execCommand("copy");
		input.setSelectionRange(0,0)
		input.blur();
	}
	async copyFromClipboard(){
		const address = await navigator.clipboard.readText();
		this.setAmount(address)
	}

	showT9(e){
		let input = e.target.closest("flow-input");
		let {value=''} = input;
		showT9({
			value, heading:input.label.replace("in KAS", ""),
			inputLabel:input.label
		}, ({value, dialog})=>{
			console.log("t9 result", value)
			input.value = value;
			this.onAmountChange();
			dialog.hide();
		})
	}
    cancel(){
    	this.hide();
    }
    onAmountChange(){
    	this.updateQRCode();
    }
    updateQRCode(){
    	this.amount = this.qS(".amount").value;


    }
}

KaspaReceiveDialogMobile.define("kaspa-receive-dialog-mobile");
