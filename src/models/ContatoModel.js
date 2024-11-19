const mongoose = require('mongoose');
const validator = require('validator')

const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome:  {type: String, required: false, default: ''},
  tel: { type: String, required: false, default: ''},
  email: { type: String, required: false, default: ''},
  criadoEm: {type: Date, default: Date.now}
});

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body){
    this.body = body
    this.errors = []
    this.contato = null
}



Contato.prototype.register = async function(){
    this.valida()
    if(this.errors.length > 0) return
    this.contato = await ContatoModel.create(this.body)
}

Contato.prototype.valida = function(){
    this.cleanUp();
    //Validação
    //O email precisa ser válido
    if (this.body.email && !validator.isEmail(this.body.email)) this.errors.push("E-mail Inválido.");
    //O nome tem que ser preenchido
    if(!this.body.nome) this.errors.push('É necessário inserir o nome!')
    // É necessário pelo menos o email ou o telefone
    if(!this.body.email && !this.body.tel) this.errors.push('É necessário ter pelo menos uma forma de contato!')
}

Contato.prototype.cleanUp = function(){
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }

    this.body = {
      nome: this.body.nome,
      sobrenome: this.body.sobrenome,
      tel: this.body.tel,
      email: this.body.email,
    };
  }

  Contato.prototype.edit = async function (id) {
    if(typeof id !== 'string') return

    this.valida()

    if(this.errors.length > 0) return

   this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true})
  }

  Contato.buscaPorId = async function (id) {
    if(typeof id !== 'string') return
    const contato = await ContatoModel.findById(id)
    return contato
}

Contato.buscaContatos = async function(){
    const contatos = await ContatoModel.find().sort({criadoEm: -1})
    return contatos
}

Contato.delete = async function(id){
    if(typeof id !== 'string') return
    const contato = await ContatoModel.findOneAndDelete({_id: id})
    return contato
}

module.exports = Contato;
