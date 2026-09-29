import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCrEImfnBQvS-kyiXW9a6wgt9IHyPTaQqE",
  authDomain: "brejin-3229a.firebaseapp.com",
  projectId: "brejin-3229a",
  storageBucket: "brejin-3229a.firebasestorage.app",
  messagingSenderId: "745284665425",
  appId: "1:745284665425:web:f3f813361c73346400b870"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


/*
========================================
SESSÃO ATUAL
========================================
*/

window.sessaoAtual = {
  carregada: false,
  autenticado: false,

  uid: null,
  nome: null,
  codigo: null,
  email: null,

  papel: null,
  empresaId: null,

  ativo: false
};


/*
========================================
PROMISE DA SESSÃO
========================================

As páginas poderão aguardar:

await window.sessaoPronta;

========================================
*/

let resolverSessao;

window.sessaoPronta = new Promise(resolve => {
  resolverSessao = resolve;
});


/*
========================================
CARREGAR USUÁRIO
========================================
*/

onAuthStateChanged(auth, async (usuarioAuth) => {

  try {

    /*
    ------------------------------------
    NÃO ESTÁ LOGADO
    ------------------------------------
    */

    if (!usuarioAuth) {

      window.sessaoAtual.carregada = true;
      window.sessaoAtual.autenticado = false;

      resolverSessao(window.sessaoAtual);

      /*
      Não redirecionamos automaticamente
      se estivermos na página de login.
      */

      const paginaAtual =
        window.location.pathname
          .split("/")
          .pop()
          .toLowerCase();

      if (
        paginaAtual !== "index.html" &&
        paginaAtual !== ""
      ) {

        window.location.href = "index.html";
      }

      return;
    }


    /*
    ------------------------------------
    USUÁRIO AUTENTICADO
    ------------------------------------
    */

    const uid = usuarioAuth.uid;

    const usuarioRef =
      doc(db, "usuarios", uid);

    const usuarioSnap =
      await getDoc(usuarioRef);


    if (!usuarioSnap.exists()) {

      console.error(
        "Documento do usuário não encontrado:",
        uid
      );

      await signOut(auth);

      alert(
        "Sua conta está autenticada, mas seu cadastro no sistema não foi encontrado."
      );

      window.location.href = "index.html";

      return;
    }


    const dados = usuarioSnap.data();


    /*
    ------------------------------------
    CONTA DESATIVADA
    ------------------------------------
    */

    if (dados.ativo !== true) {

      await signOut(auth);

      alert(
        "Seu usuário está desativado."
      );

      window.location.href = "index.html";

      return;
    }


    /*
    ------------------------------------
    PREENCHER SESSÃO
    ------------------------------------
    */

    window.sessaoAtual = {

      carregada: true,
      autenticado: true,

      uid: uid,

      nome:
        dados.nome ||
        usuarioAuth.displayName ||
        "",

      codigo:
        dados.codigo ||
        "",

      email:
        dados.email ||
        usuarioAuth.email ||
        "",

      papel:
        dados.papel ||
        "",

      empresaId:
        dados.empresaId ||
        null,

      ativo:
        dados.ativo === true
    };


    console.log(
      "Sessão carregada:",
      window.sessaoAtual
    );


    /*
    ------------------------------------
    LIBERAR AS PÁGINAS
    ------------------------------------
    */

    resolverSessao(
      window.sessaoAtual
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar sessão:",
      erro
    );

    window.sessaoAtual.carregada = true;

    resolverSessao(
      window.sessaoAtual
    );
  }

});


/*
========================================
FUNÇÕES DISPONÍVEIS
========================================
*/


window.obterSessao = function () {

  return window.sessaoAtual;

};


window.ehMaster = function () {

  return (
    window.sessaoAtual.papel === "master"
  );

};


window.temEmpresa = function () {

  return !!window.sessaoAtual.empresaId;

};


window.obterEmpresaId = function () {

  return window.sessaoAtual.empresaId;

};


window.sairSistema = async function () {

  try {

    await signOut(auth);

    window.location.href =
      "index.html";

  } catch (erro) {

    console.error(
      "Erro ao sair:",
      erro
    );

  }

};
