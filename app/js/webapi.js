/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('webapi', ['utils'])

/* CONSTANTES
.factory('$campos', [function(){
   return{
      administracao : {
        pessoa : {
            id_pesssoa : 100,
            nm_pessoa : 101, 
            dt_nascimento : 102,
            nu_telefone : 103,
            nu_ramal : 104
        },
        tblogacessousuario : {
            idLogAcessoUsuario : 100,
            idUser : 101,
            dsUrl : 102,
            idController : 103,
            idMethod : 104,
            dsParametros : 105,
            dsFiltros : 106,
            dtAcesso : 107,
            dsAplicacao : 108,
            codResposta : 109,
            msgErro : 110,
            dsJson : 111,
            // Relacionamentos
            webpagesusers : 200,
            webpagescontrollers : 300
        },
        webpagescontrollers : {
            id_controller : 100,
            ds_controller: 101,
            nm_controller: 102, // nome do controller usado no angular
            fl_menu: 103, // se true, aparece como MENU raiz
            id_subController: 104, // se for filho de alguém, setar o ID dele aqui (FK)
            // Relacionamentos
            webpagesroles : 200
        },
        webpagesmembership : {
            UserId : 100,
            Password : 106
        },
        webpagesmethods : {
            id_method : 100,
            ds_method : 101,
            nm_method : 102,
            fl_menu : 103,
            id_controller : 104
        },
        /*webpagespermissions : {
            id_roles : 100,
            id_method : 101,
            fl_principal : 102,
            // Relacionamentos
            controller : 200
        },
        webpagesrolelevels : {
            LevelId : 100,
            LevelNome : 101
        },   
        webpagesroles : {
            RoleId : 100,
            RoleName : 101,
            RolePrincipal : 102,
            RoleLevel : 103
        }, 
        webpagesusers : {
            id_users : 100,
            ds_login : 101,
            ds_email : 102,
            id_grupo : 103,
            nu_cnpjEmpresa : 104,
            nu_cnpjBaseEmpresa : 105,
            id_pessoa : 106,
            // Relacionamentos   
            pessoa : 200,
            grupo_empresa : 300,
            empresa : 400,
            webpagesusersinroles : 500
        },
        webpagesusersinroles : {
            UserId : 100,
            RoleId : 101
        }
      },
      card : {
        tbadquirente : {
            cdAdquirente : 100,
            nmAdquirente : 101,
            dsAdquirente : 102,
            stAdquirente : 103,
            hrExecucao : 104
        },
        tbcontacorrente: {
            idContaCorrente : 100,
            cdGrupo : 101,
            nrCnpj : 102,
            cdBanco : 103, 
            nrAgencia : 104
            nrConta : 105
        },
        tbcontacorrentetbloginadquirenteempresa: {
            cdContaCorrente : 100,
            cdLoginAdquirenteEmpresa : 101,
            dtInicio : 102,
            dtFim : 103
            // Relacionamentos
            empresa : 200,
            adquirente : 300
        },
        tbextrato : {
            idExtrato : 100,
            cdContaCorrente : 101,
            dtExtrato : 102,
            nrDocumento : 103,
            dsDocumento : 104,
            vlMovimento : 105
        },
        tbloginadquirenteempresa: {
            cdLoginAdquirenteEmpresa : 100,
            cdAdquirente : 101,
            cdGrupo : 102,
            nrCNPJ : 103,
            dsLogin : 104,
            dsSenha : 105,
            cdEstabelecimento : 106,
            dtAlteracao : 107,
            stLoginAdquirente : 108,
            stLoginAdquirenteEmpresa : 109, // controle de Bruno 
            // Relacionamentos
            tbadquirente : 200,
            empresa : 300
        },
      },
      cliente : {
        empresa : {
            nu_cnpj : 100,
            nu_BaseCnpj : 101,
            nu_SequenciaCnpj : 102,
            nu_DigitoCnpj : 103,
            ds_fantasia : 104,
            ds_razaoSocial : 105,
            ds_endereco : 106,
            ds_cidade : 107,
            sg_uf : 108,
            nu_cep : 109,
            nu_telefone : 110,
            ds_bairro : 111,
            ds_email : 112,
            dt_cadastro : 113,
            fl_ativo : 114,
            token : 115,
            id_grupo : 116,
            filial : 117,
            nu_inscEstadual : 118
        },
        grupoempresa : {
            id_grupo : 100,
            ds_nome : 101,
            dt_cadastro : 102,
            token : 103,
            fl_cardservices : 104,
            fl_taxservices : 105,
            fl_proinfo : 106
        }
      },
      pos :{
        adquirente : {
            id : 100,
            nome : 101,
            descricao : 102,
            status : 103,
            hraExecucao : 104
        },
        bandeirapos : {
            id : 100,
            desBandeira : 101,
            idOperadora : 102
        },
        loginoperadora : {
            id : 100,
            login : 101,
            senha : 102,
            data_alteracao : 103,
            status : 104,
            cnpj : 105,
            idOperadora : 106,
            idGrupo : 107,
            estabelecimento : 108
        },
        operadora : {
            id : 100,
            nmOperadora : 101,
            idGrupoEmpresa : 102,
            // Relacionamento
            empresa : 300
        },
        recebimento : {
            id : 100,
            idBandeira : 101,
            cnpj : 102,
            nsu : 103,
            cdAutorizador : 104,
            dtaVenda : 105,
            valorVendaBruta : 106,
            valorVendaLiquida : 107,
            loteImportacao : 108,
            dtaRecebimento : 109,
            idLogicoTerminal : 110,
            codTituloERP : 111,
            codVendaERP : 112,
            codResumoVenda : 113,
            numParcelaTotal : 114,
            // Relacionamento
            operadora : 300,
            empresa : 400, // pode ser usado para buscar o id_grupo
            bandeira : 500,
            terminallogico : 600
        },
        recebimentoparcela : {
            idRecebimento : 100,
            numParcela : 101,
            valorParcelaBruta : 102,
            valorParcelaLiquida : 103,
            dtaRecebimento : 104,
            valorDescontado : 105,
            // Relacionamento
            empresa : 300,
            operadora : 400,
            bandeira : 500,
            recebimento : 600
        },
        terminallogico : {
            idTerminalLogico: 100,
            dsTerminalLogico : 101,
            idOperadora : 102    
        }
      },
      util : {
        bancos : {
            Codigo : 100,
            NomeReduzido : 101,
            NomeExtenso : 102
        }
      }
   }
}])*/


.factory('$apis', ['$autenticacao', function($autenticacao){

  return {
    /**
      * Obtem a url completa, considerando os parâmetros e os filtros.  
      * Se não for desejado utilizar filtro, apenas chamar a função usando dois argumentos em vez de três. 
      *
      * OBS: UPDATE E DELETE não possui parâmetros => só filtros. 
      *      Para esse caso, enviar undefined como segundo parâmetro dessa função (parametros = undefined) 
      *
      *
      * @param api : url da web api
      * @param parametros: apenas uma string ou um array de strings/integers
      *                    ORDEM: 0) token
      *                           1) colecao: 0 = min (default) | 1 = max
      *                           2) campoOrderBy: id do campo que define a ordenação
      *                           3) orderBy : 0 = crescente (default) | 1 = decrescente)
      *                           4) itensPorPagina : total de itens desejados para a busca
      *                           5) pagina : página a ser exibida
      * @param filtros : JSON ou array de JSON, ao qual cada elemento contem um 'id' e um 'valor'
      *                  OBS: Para between de data, passar {CODIGO_DATA : DATA_INICIO%DATA_FIM}
      */  
    getUrl : function(api, parametros, filtros){
      // Se for uma string, somente concatena ela    
      if(parametros){
          if(typeof parametros === 'string'){ 
              // Se for enviado uma string vazia, não concatena
              if(parametros.length > 0) api = api.concat(parametros + '/');
          }else{  
              // Objeto array => Concatena todos
              for(var k = 0; k < parametros.length; k++) api = api.concat(parametros[k] + '/');
          }  
      }
      
      // Filtros
      if(filtros){
         api = api.concat('?');
         // Se for array, percorre todo ele  
         if(angular.isArray(filtros)){  
             for(var k = 0; k < filtros.length; k++){ 
                 api = api.concat(filtros[k].id + '=' + filtros[k].valor);
                 if(k < filtros.length - 1) api = api.concat('&');
             }
         }else api = api.concat(filtros.id + '=' + filtros.valor); // é apenas um json
      }
    
      return api;      
    },  
      
 
    administracao : {
        pessoa : $autenticacao.getUrlBase() + '/administracao/pessoa/',
        tblogacessousuario : $autenticacao.getUrlBase() + '/administracao/tblogacessousuario/',
        webpagescontrollers : $autenticacao.getUrlBase() + '/administracao/webpagescontrollers/',
        webpagesmembership : $autenticacao.getUrlBase() + '/administracao/webpagesmembership/',
        webpagesmethods : $autenticacao.getUrlBase() + '/administracao/webpagesmethods/',
        webpagespermissions : $autenticacao.getUrlBase() + '/administracao/webpagespermissions/',
        webpagesrolelevels : $autenticacao.getUrlBase() + '/administracao/webpagesrolelevels/',
        webpagesroles : $autenticacao.getUrlBase() + '/administracao/webpagesroles/',
        webpagesusers : $autenticacao.getUrlBase() + '/administracao/webpagesusers/', 
        webpagesusersinroles : $autenticacao.getUrlBase() + '/administracao/webpagesusersinroles/'
    },
    card : {
        tbadquirente : $autenticacao.getUrlBase() + '/card/tbadquirente/',
        tbcontacorrente: $autenticacao.getUrlBase() + '/card/tbcontacorrente/',  
        tbcontacorrentetbloginadquirenteempresa : $autenticacao.getUrlBase() + '/card/tbcontacorrentetbloginadquirenteempresa/', 
        tbextrato : $autenticacao.getUrlBase() + '/card/tbextrato/', 
        tbloginadquirenteempresa : $autenticacao.getUrlBase() + '/card/tbloginadquirenteempresa/', 
        uploadextrato : $autenticacao.getUrlBase() + '/card/testeupload/',    
    },
    cliente: {
        empresa : $autenticacao.getUrlBase() + '/cliente/empresa/',
        grupoempresa : $autenticacao.getUrlBase() + '/cliente/grupoempresa/'
    },
    pos : {
        adquirente : $autenticacao.getUrlBase() + '/pos/adquirente/',
        bandeirapos : $autenticacao.getUrlBase() + '/pos/bandeirapos/',
        loginoperadora : $autenticacao.getUrlBase() + '/pos/loginoperadora/',
        operadora : $autenticacao.getUrlBase() + '/pos/operadora/',
        recebimento : $autenticacao.getUrlBase() + '/pos/recebimento/',
        recebimentoparcela: $autenticacao.getUrlBase() + '/pos/recebimentoparcela/',
        terminallogico : $autenticacao.getUrlBase() + '/pos/terminallogico/'
    },
    utils : {
        bancos : $autenticacao.getUrlBase() + '/utils/bancos/',    
    }
  }
}])