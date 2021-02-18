import {html, css, KaspaDialog} from './kaspa-dialog.js';
const pass = "";

class KaspaOpenDialog extends KaspaDialog{

	static get properties() {
		return {
			mode:{type:String, reflect:true},
			inputType:{type:String},
			isFresh:{type:Boolean, reflect:true}
		};
	}

	static get styles(){
		return [KaspaDialog.styles, css`
			.container{max-height:var(--kaspa-dialog-container-max-height, 600px)}
			:host([mode="create"]) .container{max-height:var(--kaspa-dialog-container-max-height, 500px)}
			:host([mode="init"]) .container{max-height:var(--kaspa-dialog-container-max-height, 200px)}
			:host([mode="recover"]) .container{max-height:var(--kaspa-dialog-container-max-height, 450px)}
			.buttons{justify-content:center;--kaspa-dialog-buttons-width:100%;}
			:host([mode="init"]) .buttons{justify-content:center}
			:host([mode="open"]) .inner-body{padding:0px 30px;}

			.text-center, .heading{text-align:center;}
			.words{margin:20px 0px;max-width:500px;margin:auto;}
			.words .row{display:flex;justify-content:center;}
			.words .cell{flex:1;width:10px;text-align:center;padding:5px}
			input.seed{
				border:2px solid var(--flow-primary-color);
				border-radius:7px;padding:10px 5px;max-width:120px;
				text-align:center;width:100%;box-sizing:border-box;
			}
			:host[isFresh] .close-btn{display:none}
			.big-logo{max-width:150px;margin:10px auto 20px;display:block;}
			.bottom-spacer{height:200px}
		`];
	}
	constructor() {
		super();

		window.showWalletInitDialog = (args, callback)=>{

			//return callback(null, {password:"Asd123###", dialog:this, mode:"open"});
			this.wallet = args.wallet;
			this.hideable = !!args.hideable;
			this.mode = args.mode||"open";
			this.lastMode = this.mode;
			this.callback = callback;
			this.isFresh = !!args.isFresh;

			this.args = args;
			this.show();
		}

		window.hideWalletInitDialog = ()=>{
			this.hide();
		}

		this.mode = "init";
		this.inputType = "password";
	}
	buildRenderArgs(){
		let {mode} = this;
		let modeName = mode[0].toUpperCase()+mode.substr(1);
		return {modeName};
	}
	renderHeading({modeName}){
		if(modeName == 'Init')
			return '';
		return `${modeName} Wallet`;
	}
	renderBody({modeName}){
		return this[`render${modeName}UI`]();
	}
	renderButtons({modeName}){
		return this[`render${modeName}Buttons`]?.()||'';
	}
	renderInitUI(){
		return html`
			<div class="sub-heading text-center">Welcome to Kaspa Wallet</div>
		`
	}
	renderRecoverUI(){
		let rows = [0, 1, 2];
		let cells = [0, 1, 2, 3];
		let seed = [];//(testSeed||'').split(" ");
		return html`
			<p class="sub-heading text-center">
				Enter your 12-word seed phrase to recover your wallet
			</p>
			<div class="words" @input=${this.onSeedInput}>
				${rows.map((v, index)=>{
					return html`
					<div class="row">
						${cells.map((v, i)=>{
							return html`
							<div class="cell">
								<input class="seed word" value="${seed[index*4+i]||''}" data-index="${index*4+i}" />
							</div>
							`;
						})}
					</div>
					`;
				})}
			</div>
			<div class="error">${this.errorMessage}</div>
		`
	}
	renderOpenUI(){
		let icon = this.inputType=="password"?'eye':'eye-slash';
		return html`
			<div><img class="big-logo" src="/resources/images/kaspa.png" /></div>
			<div class="sub-heading">Unlock the wallet with your password:</div>
			<flow-input class="password full-width" outer-border value="${pass}"
				type="${this.inputType}" placeholder="Password"
				@keyup="${this.onOpenPassKeyup}">
				<fa-icon class="input-type-btn" slot="sufix"
					@click="${this.changeInputType}"
					icon="${icon}"></fa-icon>
			</flow-input>
			<div class="error">${this.errorMessage}</div>
			<div class='buttons'>${this._renderOpenButtons()}</div>
			<div class="bottom-spacer" ?hidden=${!isMobile}></div>
		`
	}
	renderCreateUI(){
		let icon = this.inputType=="password"?'eye':'eye-slash';
		return html`
			<div class="sub-heading">Create a password for your new wallet</div>
			<flow-input class="password full-width" outer-border value="${pass}"
				type="${this.inputType}" placeholder="Password">
				<fa-icon class="input-type-btn" slot="sufix"
					@click="${this.changeInputType}"
					icon="${icon}"></fa-icon>
			</flow-input>
			<div class="sub-heading">Confirm password</div>
			<flow-input class="cfm-password full-width" outer-border value="${pass}"
				type="${this.inputType}" placeholder="Confirm Password"
				@keyup="${this.onCreatePassKeyup}">
				<fa-icon class="input-type-btn" slot="sufix"
					@click="${this.changeInputType}"
					icon="${icon}"></fa-icon>
			</flow-input>
			<div class="error">${this.errorMessage}</div>
		`
	}
	_renderOpenButtons(){
		return html`
			<flow-btn @click="${e=>this.mode='create'}">NEW WALLET</flow-btn>
			<flow-btn primary @click="${this.openWallet}">OPEN WALLET</flow-btn>`;
	}
	renderCreateButtons(){
		return html`
			<flow-btn @click="${e=>this.mode=this.lastMode}">Cancel</flow-btn>
			<flow-btn ?hidden=${this.isFresh} 
				@click="${e=>this.mode='open'}">I have wallet</flow-btn>
			<flow-btn primary @click="${this.showSeeds}">Next</flow-btn>
			`;
	}
	renderInitButtons(){
		return html`
			<flow-btn class="primary"
				@click="${e=>this.mode='create'}">Create New Wallet</flow-btn>
			<flow-btn class="primary"
				@click="${e=>this.mode='recover'}">Recover from Seed</flow-btn>`;
	}
	renderRecoverButtons(){
		
		return html`
			<flow-btn @click="${this.cancelRecover}">Cancel</flow-btn>
			<flow-btn primary @click="${this.recoverWallet}">Recover Wallet</flow-btn>`;
	}
	cancelRecover(){
		if(this.args?.backToWallet){
			return this.hide()
		}
		this.mode = "init";
	}
	updated(changes){
        super.updated(changes);
        if(changes.has('mode')){
        	this.inputType = "password";
        	this.errorMessage = "";
        }
    }

    changeInputType(){
    	this.inputType = this.inputType=="password"?'text':'password';
    }
    onOpenPassKeyup(e){
    	if(e.which == 13)
    		this.openWallet();
    }
    openWallet(){
    	let password = this.qS(".password").value;
    	// if(!this.checkPassword(password))
    	// 	return this.setError("At least 8 characters, one capital, one lower, one number, and one symbol")

    	this.callback(null, {password, dialog:this});
    }
    onCreatePassKeyup(e){
    	if(e.which == 13)
    		this.showSeeds();
    }
    showSeeds(){
    	let password = this.qS(".password").value.trim();
    	let password2 = this.qS(".cfm-password").value;
    	if(!this.checkPassword(password))
    		return this.setError("At least 8 characters, one capital, one lower, one number, and one symbol")

    	if(password != password2)
    		return this.setError("Passwords do not match")

    	this.callback(null, {mode:"create", password, dialog:this});
    }
    onSeedInput(e){
    	let input = e.target.closest("input.seed");
    	if(!input || input.dataset.index != "0")
    		return
    	let words = (input.value+"").split(" ");
    	if(words.length<2)
    		return

    	this.qSAll("input.seed.word").forEach(input=>{
    		let index = input.dataset.index;
    		input.value = words[index];
    	});

    }
    recoverWallet(){
    	let wordsMap = {};
    	let isInvalid = false;
    	this.qSAll("input.seed.word").forEach(input=>{
    		let index = input.dataset.index;
    		wordsMap[index] = input.value;
    		if(input.value.length<2)
    			isInvalid = true;
    	});

    	let words = [];
    	for(let i=0; i<12; i++){
    		words.push(wordsMap[i])
    	}

    	if(isInvalid || !words.join("").length)
    		return this.setError("Please provide valid words");

    	console.log("words", words);
    	askForPassword({
    		title:"Password to encryt the wallet",
    		confirmBtnText:"Encrypt Wallet"
    	}, ({btn, password})=>{
    		console.log("btn, password", btn, password, words)
    		if(!password || btn != 'confirm')
    			return

	    	this.callback(null, {seedPhrase:words.join(" "), password, dialog:this});
	    })
    }
}

KaspaOpenDialog.define("kaspa-open-dialog");