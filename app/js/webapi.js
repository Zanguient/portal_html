/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.1.4 - 01/04/2016
 *  - conciliacaovendas
 *
 *  Versão 1.1.3 - 28/03/2016
 *  - vendaserp
 *  - tbrecebimentovenda
 *  - correcaovendaerp
 *
 *  Versão 1.1.2 - 05/02/2016
 *  - tbantecipacaobancaria
 *
 *  Versão 1.1.1 - 20/11/2015
 *  - tbrecebimentotef
 *  - pdvs
 *
 *  Versão 1.1.0 - 18/11/2015
 *  - tituloserp
 *
 *  Versão 1.0.9 - 16/11/2015
 *  - tbrecebimentotitulo
 *  - tbrecebimentoajuste
 *  - dealernet
 *  - baixaautomaticaerp
 *
 *  Versão 1.0.8 - 13/11/2015
 *  - relatorioconciliacaotitulos
 *
 *  Versão 1.0.7 - 09/11/2015
 *  - conciliacaotitulos
 *
 *  Versão 1.0.6 - 05/11/2015
 *  - conciliacaorelatorios
 *
 *  Versão 1.0.5 - 23/10/2015
 *  - relatoriovendas
 *
 *  Versão 1.0.4 - 20/10/2015
 *  - recebiveisfuturos
 *
 *  Versão 1.0.3 - 09/10/2015
 *  - tbbandeira
 *
 *  Versão 1.0.2 - 11/09/2015
 *  - apiRezende : Urls referente a pgsql
 *
 *  Versão 1.0.1 - 08/09/2015
 *  - administracao/tbempresa
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

angular.module('webapi', ['utils'])

/* CONSTANTES
.factory('$campos', [function(){
   return{
      administracao : {
        logacesso : {
            idUsers : 100,
            idController : 101,
            idMethod : 102,
            dtAcesso : 103,
            flMobile : 104,
            dsUserAgent : 105,
            // Relacionamentos
            webpagesusers : 200,
            webpagescontrollers : 300
        },
        pessoa : {
            id_pesssoa : 100,
            nm_pessoa : 101, 
            dt_nascimento : 102,
            nu_telefone : 103,
            nu_ramal : 104
        },
        tbempresa : {
            nrCNPJBase : 100,
            dsCertificadoDigital : 101,
            dsCertificadoDigitalSenha : 102,
            cdEmpresaGrupo : 103,
            dtCadastro : 104,
            dtValidade : 105,
            flSenhaValida : 106,
            // Relacionamentos
            tbEmpresaGrupo : 200,
        },
        tbempresagrupo : {
            cdEmpresaGrupo : 100,
            dsEmpresaGrupo : 101,
            dtCadastro : 102,
            flCardServices : 103,
            flTaxServices : 104,
            flProinfo : 105,
            cdVendedor : 106,
            flAtivo : 107
        },
        tblogacessousuario : {
            idLogAcessoUsuario : 100,
            idUser : 101,
            dsUrl : 102,
            idController : 103,
            dsParametros : 104,
            dsFiltros : 105,
            dtAcesso : 106,
            dsAplicacao : 107,
            codResposta : 108,
            msgErro : 109,
            dsJson : 110,
            dsUserAgente : 111,
            dsMethod : 112,
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
        baixaautomaticaerp : {
            idExtrato : 100,
            id_grupo : 101
        },
        conciliacaobancaria : {
            data = 100, 
            tipo = 101,
            id_grupo = 102,
            nu_cnpj = 103,
            // Relacionamentos
            operadora : 200,
            tbadquirente : 300,
            cdContaCorrente : 400
        },
        conciliacaorelatorios : {
            data : 100,
            id_grupo : 101,
            nu_cnpj : 102,
        },
        conciliacaotitulos : {
            data = 100, 
            tipo = 101,
            id_grupo = 102,
            nu_cnpj = 103,
            preconcilia_grupo = 104,
            nsu = 105,
            // Relacionamentos
            tbadquirente : 200,
            recebimentoparcela : 300
        },
        conciliacaovendas : {
            data = 100, 
            tipo = 101,
            id_grupo = 102,
            nu_cnpj = 103,
            preconcilia_grupo = 104,
            nsu = 105,
            // Relacionamentos
            tbadquirente : 200,
            tbrecebimentovenda : 300
        },
        recebiveisfuturos : {
            data : 100,
            id_grupo : 101,
            cdContaCorrente : 102,
            cdAdquirente : 103,
        },
        relatorioconciliacaotitulos : {
            data = 100,
            id_grupo = 101,
            nu_cnpj = 102,
            nu_cnpj_titulo = 103,
            tipo = 104,
            // Relacionamentos
            tbadquirente : 200,
        },
        relatoriovendas : {
            data : 100,
            id_grupo : 101,
            nu_cnpj : 102,
            cdAdquirente : 103,
        },
        tbadquirente : {
            cdAdquirente : 100,
            nmAdquirente : 101,
            dsAdquirente : 102,
            stAdquirente : 103,
            hrExecucao : 104,
            // Relacionamentos
            cnpj : 305,
            id_grupo : 316
        },
        tbantecipacaobancaria: {
            idAntecipacaoBancaria : 100,
            cdContaCorrente : 101,
            dtAntecipacaoBancaria : 102,
            cdAdquirente : 103,
            vlOperacao : 104,
            vlLiquido : 105,
            // Relacionamentos
            tbantecipacaobancariadetalhe : 200
        },
        tbantecipacaobancariadetalhe: {
            idAntecipacaoBancariaDetalhe : 100,
            idAntecipacaoBancaria : 101,
            dtVencimento : 102,
            vlAntecipacao : 103,
            vlAntecipacaoLiquida : 104,
            cdBandeira : 105,
        },
        tbbancoparametro : {
            cdBanco : 100,
            dsMemo : 101,
            cdAdquirente : 102,
            dsTipo : 103,
            flVisivel : 104,
            nrCnpj : 105,
            // Relacionamentos
            tbadquirentes : 200
        },
        tbbandeira : {
            cdBandeira : 100,
            dsBandeira : 101,
            cdAdquirente : 102,
            dsTipo : 103
        },
        tbcontacorrente: {
            cdContaCorrente : 100,
            cdGrupo : 101,
            nrCnpj : 102,
            cdBanco : 103, 
            nrAgencia : 104
            nrConta : 105,
            flAtivo : 106
        },
        tbcontacorrentetbloginadquirenteempresa: {
            cdContaCorrente : 100,
            cdLoginAdquirenteEmpresa : 101,
            dtInicio : 102,
            dtFim : 103
            // Relacionamentos
            empresa : 200,
            adquirente : 300,
            nu_cnpj : 500,
            id_grupo : 516,
            stLoginAdquirenteEmpresa : 608,
        },
        tbextrato : {
            idExtrato : 100,
            cdContaCorrente : 101,
            dtExtrato : 102,
            nrDocumento : 103,
            dsDocumento : 104,
            vlMovimento : 105,
            // Relaciomentos
            empresa : 200,
            tbadquirente : 300,
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
        tbrecebimentoajuste : {
            idRecebimentoAjuste : 100,
            dtAjuste : 101,
            nrCNPJ : 102,
            cdBandeira : 103,
            dsMotivo : 104,
            vlAjuste : 105,
            idExtrato : 106,
            // RELACIONAMENTOS
            empresa : 216,
            tbBandeira : 300,
        },
        tbrecebimentotef : {
            idRecebimentoTEF : 100,
            cdGrupo : 101,
            nrCNPJ : 102,
            cdEmpresaTEF : 103,
            nrPDVTEF : 104,
            nrNSUHost : 105,
            nrNSUTEF : 106,
            cdAutorizacao : 107,
            cdSituacaoRedeTEF : 108,
            dtVenda : 109,
            hrVenda : 110,
            vlVenda : 111,
            qtParcelas : 112,
            nrCartao : 113, 
            cdBandeira : 114,
            nmOperadora : 115,
            dthrVenda : 116,
            cdEstadoTransacaoTEF : 117,
            cdTrasacaoTEF : 118,
            cdModoEntradaTEF : 119,
            cdRedeTEF : 120,
            cdProdutoTEF : 121,
            cdBandeiraTEF : 122,
            cdEstabelecimentoHost : 123
        },
        tbrecebimentotitulo: {
            idrecebimentotitulo : 100,
            nrCNPJ : 101,
            nrNsu : 102,
            dtVenda : 103,
            cdAdquirente : 104,
            dsBandeira : 106,
            vlVenda : 107,
            qtParcelas : 108,
            dtTitulo : 109,
            vlParcela : 110,
            nrParcela : 111,
            cdERP : 112,
            dtBaixaERP : 113,
            // RELACIONAMENTOS
            id_grupo = 216,
            idExtrato = 306,
        },
        tbrecebimentovenda: {
            idRecebimentoVenda : 100,
            nrCNPJ : 101,
            nrNSU : 102,
            dtVenda : 103,
            cdAdquirente : 104,
            dsBandeira : 106,
            vlVenda : 107,
            qtParcelas : 108,
            cdERP : 109,
            // RELACIONAMENTOS
            id_grupo = 216,
        },
        tituloserp : {
            data : 100,
            id_grupo : 101
        },
        vendaserp : {
            data : 100,
            id_grupo : 101
        }
      },
      cartao : {
        pdvs : {
            IdPDV : 100,
            CNPJjFilial : 101,
            DecricaoPdv : 102,
            CodPdvERP : 103,
            cdEmpresaTEF : 104,
            CodPdvHostPagamento : 105,
            cdGrupo : 106
        }
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
            cdBandeira : 115,
            // Relacionamento
            operadora : 300,
            empresa : 400, // pode ser usado para buscar o id_grupo
            bandeira : 500,
            terminallogico : 600,
            tbadquirente : 700
        },
        recebimentoparcela : {
            idRecebimento : 100,
            numParcela : 101,
            valorParcelaBruta : 102,
            valorParcelaLiquida : 103,
            dtaRecebimento : 104,
            valorDescontado : 105,
            idExtrato : 106,
            dtaRecebimentoEfetivo : 107,
            // Relacionamento
            empresa : 300,
            operadora : 400,
            bandeira : 500,
            recebimento : 600,
            tbadquirente : 700,
            tbbandeira : 800,
            tbContaCorrente : 900,
            sem_ajustes_antecipacao : 1000,
            // EXPORTAR
            exportar : 9999
        },
        terminallogico : {
            idTerminalLogico: 100,
            dsTerminalLogico : 101,
            idOperadora : 102,
            // Relacionamentos
            idGrupoEmpresa : 200,
            cdAdquirente : 300
        }
      },
      tax : {
        tbmanifesto : {
            idManifesto : 100,
            nrChave : 101,
            nrNSU : 102,
            cdGrupo : 103,
            nrCNPJ : 104,
            nrEmitenteCNPJCPF : 105,
            nmEmitente : 106,
            nrEmitenteIE : 107,
            dtEmissao : 108,
            tpOperacao : 109, 
            vlNFe : 110,
            dtRecebimento : 111,
            cdSituacaoNFe : 112,
            cdSituacaoManifesto : 113,
            dsSituacaoManifesto : 114,
            nrProtocoloManifesto : 115,
            xmlNFe : 115,
            nrProtocoloDownload : 116,
            cdSituacaoDownload : 117,
            dsSituacaoDownload : 118,
        },    
      },
      util : {
        bancos : {
            Codigo : 100,
            NomeReduzido : 101,
            NomeExtenso : 102
        }
      }
      
      
      // DEALERNET
      dealernet: {
        consultatitulos : {
            data : 100
        }
      },
      
      
      // REZENDE
      rezende : {
        pgsql : {
            pdvs : {
                sequencia : 100,
                tipo : 101,
                data : 102,
                hora : 103,
                valor : 104,
                num_autorizacao : 105,
                cod_pdv : 106,
                cod_pessoa : 107,
                cod_empresa : 108,
                // Relacionamentos
                tab_pdv : 200,
                tabpessoa : 300,
                tabempresa : 400
            },
            tabcupomfiscal : {
                seq_cupom : 100,
                seq_fechamneto : 101,
                dta_cupom : 103,
                hra_fim : 105,
                val_total_cupom : 111,
                ind_cancelado : 113,
                num_serie_ecf : 117,
                ind_status : 121,
                cod_empresa : 140,
                // Relacionamentos
                tabpagamentocupom : 300
                tabpdv : 400
            },
            tabduplicatareceber : {
                seq_fechamento : 100,
                seq_duplicata : 101,
                cod_pessoa_sacado : 103,
                seq_cupom : 116,
            },
            tabempresa : {
                cod_empresa : 100,
                nom_razao_social : 103,
                nom_fantasia : 104,
                num_cnpj : 105,
            },
            tabformapagtopdv : {
                cod_forma_pagto : 100,
                des_forma_pagto : 101,
                ind_tipo : 102,
                cod_pessoa_sacado : 104,
                ind_transacao_tef : 106,
            },
            tabnotafiscalsaida : {
                seq_nota : 100,
                cod_empresa : 101,
                dta_emissao : 104,
                val_total_nota : 131,
                ind_status : 140,
                hra_saida : 170,
                seq_fechamento : 221,
                cod_pdv : 222,
                seq_cupom_nfc : 242,
                ind_nfc_pdv : 243,
                // Relacionamentos
                tabpagamentonfspdv : 300,
            },
            tabpagamentocupom : {
                seq_cupom : 100,
                seq_pagamento : 101,
                cod_forma_pagto : 102,
                val_pagamento : 103,
                cod_pessoa_sacado : 129,
                num_autorizacao_pos : 132,
                // Relacionamentos
                tabcupomfiscal : 300,
                tabpdv : 600,
                tabformapagtopdv : 700,
            },
            tabpagamentonfspdv : {
                seq_nota : 101,
                seq_pagamento : 102,
                cod_forma_pagto : 103,
                val_pagamento : 104,
                cod_pessoa_sacado : 130,
                num_autorizacao_pos : 133,
                // Relacionamentos
                tabnotafiscalsaida : 300,
                tabformapagtopdv : 600,
            },
            tabpdv : {
                cod_pdv : 100,
                cod_empresa : 101,
                des_pdv : 102,
                ind_pdv_desativado : 207,
                num_fabricacao : 110,
            },
            tabpessoa : {
                cod_pessoa : 100,
                nom_pessoa : 101,
                ind_administradora_cartao : 133,
            }
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
        logacesso : $autenticacao.getUrlBase() + '/administracao/logacesso/',   
        pessoa : $autenticacao.getUrlBase() + '/administracao/pessoa/',
        tbempresa : $autenticacao.getUrlBase() + '/administracao/tbempresa/',
        tblogacessousuario : $autenticacao.getUrlBase() + '/administracao/tblogacessousuario/',
        webpagescontrollers : $autenticacao.getUrlBase() + '/administracao/webpagescontrollers/',
        webpagesmembership : $autenticacao.getUrlBase() + '/administracao/webpagesmembership/',
        webpagesmethods : $autenticacao.getUrlBase() + '/administracao/webpagesmethods/',
        webpagespermissions : $autenticacao.getUrlBase() + '/administracao/webpagespermissions/',
        webpagesrolelevels : $autenticacao.getUrlBase() + '/administracao/webpagesrolelevels/',
        webpagesroles : $autenticacao.getUrlBase() + '/administracao/webpagesroles/',
        webpagesusers : $autenticacao.getUrlBase() + '/administracao/webpagesusers/', 
        webpagesusersinroles : $autenticacao.getUrlBase() + '/administracao/webpagesusersinroles/',
        tbcatalogo : $autenticacao.getUrlBase() + '/administracao/tbcatalogo/'
    },
    card : {
        baixaautomaticaerp : $autenticacao.getUrlBase() + '/card/baixaautomaticaerp/',
        conciliacaobancaria : $autenticacao.getUrlBase() + '/card/conciliacaobancaria/',
        conciliacaorelatorios : $autenticacao.getUrlBase() + '/card/conciliacaorelatorios/',
        conciliacaotitulos : $autenticacao.getUrlBase() + '/card/conciliacaotitulos/',
        conciliacaovendas : $autenticacao.getUrlBase() + '/card/conciliacaovendas/',
        correcaovendaerp : $autenticacao.getUrlBase() + '/card/correcaovendaerp/',
        recebiveisfuturos : $autenticacao.getUrlBase() + '/card/recebiveisfuturos/',
        relatorioconciliacaotitulos : $autenticacao.getUrlBase() + '/card/relatorioconciliacaotitulos/',
        relatoriovendas : $autenticacao.getUrlBase() + '/card/relatoriovendas/',
        tbadquirente : $autenticacao.getUrlBase() + '/card/tbadquirente/',
        tbantecipacaobancaria : $autenticacao.getUrlBase() + '/card/tbantecipacaobancaria/',
        tbantecipacaobancariadetalhe : $autenticacao.getUrlBase() + '/card/tbantecipacaobancariadetalhe/',
        tbbancoparametro : $autenticacao.getUrlBase() + '/card/tbbancoparametro/',
        tbbandeira : $autenticacao.getUrlBase() + '/card/tbbandeira/',
        tbcontacorrente: $autenticacao.getUrlBase() + '/card/tbcontacorrente/',  
        tbcontacorrentetbloginadquirenteempresa : $autenticacao.getUrlBase() + '/card/tbcontacorrentetbloginadquirenteempresa/', 
        tbextrato : $autenticacao.getUrlBase() + '/card/tbextrato/', 
        tbloginadquirenteempresa : $autenticacao.getUrlBase() + '/card/tbloginadquirenteempresa/', 
        tbrecebimentoajuste : $autenticacao.getUrlBase() + '/card/tbrecebimentoajuste/', 
        tbrecebimentotef : $autenticacao.getUrlBase() + '/card/tbrecebimentotef/', 
        tbrecebimentotitulo : $autenticacao.getUrlBase() + '/card/tbrecebimentotitulo/', 
        tbrecebimentovenda : $autenticacao.getUrlBase() + '/card/tbrecebimentovenda/', 
        tituloserp : $autenticacao.getUrlBase() + '/card/tituloserp/', 
        vendaserp : $autenticacao.getUrlBase() + '/card/vendaserp/', 
        uploadextrato : $autenticacao.getUrlBase() + '/card/testeupload/',    
    },
    cartao : {
        pdvs :  $autenticacao.getUrlBase() + '/cartao/pdvs/',
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
    tax : {
        tbmanifesto : $autenticacao.getUrlBase() + '/tax/tbmanifesto/',
        tbmercadoria : $autenticacao.getUrlBaseTotvs() + '/tax/tbmercadoria/',
        tbmercadoriaclassificada :$autenticacao.getUrlBaseTotvs() + '/tax/tbmercadoriaclassificada/',
    },
    util : {
        bancos : $autenticacao.getUrlBase() + '/util/bancos/',   
        utilnfe : $autenticacao.getUrlBaseDownload() + '/util/utilnfe/',   
    },
      
    // DEALERNET
    dealernet: {
        consultatitulos : $autenticacao.getUrlBaseDealernet() + '/dealernet/consultatitulos/',   
    },
      
    // REZENDE
    rezende : {
        pgsql : {
            pdvs : $autenticacao.getUrlBaseRezende() + '/pgsql/pdvs/',
            //tabcupomfiscal : $autenticacao.getUrlBaseRezende() + '/pgsql/tabcupomfiscal/',
            //tabduplicatareceber : $autenticacao.getUrlBaseRezende() + '/pgsql/tabduplicatareceber/',
            tabempresa : $autenticacao.getUrlBaseRezende() + '/pgsql/tabempresa/',
            tabformapagtopdv : $autenticacao.getUrlBaseRezende() + '/pgsql/tabformapagtopdv/',
            //tabnotafiscalsaida : $autenticacao.getUrlBaseRezende() + '/pgsql/tabnotafiscalsaida/',
            //tabpagamentocupom : $autenticacao.getUrlBaseRezende() + '/pgsql/tabpagamentocupom/',
            tabpagamentonfspdv : $autenticacao.getUrlBaseRezende() + '/pgsql/tabpagamentonfspdv/',
            tabpdv : $autenticacao.getUrlBaseRezende() + '/pgsql/tabpdv/',
            tabpessoa : $autenticacao.getUrlBaseRezende() + '/pgsql/tabpessoa/',
            tbalmoxarifado: $autenticacao.getUrlBaseRezende() + '/Pgsql/TabAlmoxarifado/',
            tbnaturezaoperacao: $autenticacao.getUrlBaseRezende() + '/Pgsql/TabNaturezaOperacao/',
            tabnotafiscalentrada: $autenticacao.getUrlBaseRezende() + '/Pgsql/TabNotaFiscalEntrada/',
            tabtituloreceber: $autenticacao.getUrlBaseRezende() + '/Pgsql/tabtituloreceber/',
            //baixaautomatica: $autenticacao.getUrlBaseRezende() + '/Pgsql/baixaautomatica/',
          }
    }
  }
}])