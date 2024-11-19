const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const LoginModel = mongoose.model("Login", LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  valida() {
    this.cleanUp();
    //Validação
    //O email precisa ser válido
    if (!validator.isEmail(this.body.email)) this.errors.push("E-mail Inválido.");

    // a senha precisa ter entre 3 e 50 caracteres
    if (this.body.password.length < 3 || this.body.password.lenght > 50) {
      this.errors.push("A senha precisa ter entre 3 e 50 caracteres.");
    }
  }

  async login(){
    this.valida();
    if(this.errors.length > 0) return
    this.user = await LoginModel.findOne({email: this.body.email})

    if(!this.user){ 
        this.errors.push('Usuário não existe.')
        return
    }
    
    if(!bcrypt.compareSync(this.body.password, this.user.password)){
        this.errors.push('Senha Inválida!')
        this.user = null
        return
    }
  }

  async register() {
    this.valida();

    await this.userExists();

    if (this.errors.length > 0) return;

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);


      this.user = await LoginModel.create(this.body);
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }

    this.body = {
      email: this.body.email,
      password: this.body.password,
    };
  }

  async userExists() {
    const user = await LoginModel.findOne({email: this.body.email})
    if(user) this.errors.push('Usuário já existe.')
  }
}

module.exports = Login;
