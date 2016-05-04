/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 23/03/2016 
 *  - Envio do cnpj da conta a ser alterada o status
 *
 *  Versão 1.0.1 - 21/09/2015 
 *  - Somente filiais ativas
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-contas-correntes", []) 

.controller("administrativo-contas-correntesCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados
    $scope.contas = [];     
    $scope.filiais = [];
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyContasPos = 0; // posição da div que vai receber o loading progress
    // Modal Conta
    $scope.modalConta = { titulo : '', banco : undefined, flAtivo : true,
                          nrAgencia : '', nrConta : '', nrCnpj : '', filial: '',
                          textoConfirma : '', funcaoConfirma : function(){} };
    var old = null;    
    // Modal Adquirente Empresa 
    var adquirentesempresas = []; // todas as adquirentes-filial relacionadas ao grupo
    $scope.modalAdquirenteEmpresa = { conta : '', 
                                      adquirentesempresa : [], // originalmente as adquirente-filiais não associadas à conta
                                      vigenciaSelecionada : undefined,
                                      adquirenteEmpresaSelecionada : undefined,
                                      vigentes : [],
                                      naoSelecionadas: [] 
                                    };
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // Flags
    var cnpjValido = false;
    $scope.validandoCNPJ = false;
    $scope.buscandoBancos = false; 
    $scope.exibeTela = false;                                             
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_contasCorrentesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Contas Corrente';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){
                    buscaContas();
                    buscaFiliais();
                    buscaLoginAdquirenteEmpresa();
                }else{ // reseta tudo e não faz buscas 
                    $scope.contas = []; 
                    $scope.filiais = [];
                    $scope.modalAdquirenteEmpresa.adquirentesempresa = [];
                }
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados associados
            if($scope.usuariologado.grupoempresa){
                buscaContas();
                buscaFiliais();
                buscaLoginAdquirenteEmpresa();
            }
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega dados associados
        /*if($scope.usuariologado.grupoempresa){
            buscaContas();
            buscaFiliais();
            buscaLoginAdquirenteEmpresa();
        }*/
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar contas correntes
      */
    $scope.usuarioPodeCadastrarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar contas correntes
      */
    $scope.usuarioPodeAlterarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir contas correntes
      */
    $scope.usuarioPodeExcluirContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoRemocao;
    }                                              
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaContas();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        buscaContas();
    }; 
                                                 
            
    
    // BUSCA BANCOS  
    /**
      * Selecionou um banco
      */
    $scope.selecionouBanco = function(){
        //console.log($scope.modalConta.banco);    
    }
    /**
      * Se nenhum banco foi selecionado, apaga o conteúdo do input text
      */
    $scope.validaBanco = function(){
        if(!$scope.modalConta.banco || $scope.modalConta.banco === null) return;
        if(!$scope.modalConta.banco.Codigo) $('#buscabanco').val("");    
    }
    /**
      * Busca o banco digitado
      */
    $scope.buscaBancos = function(texto){
        $scope.buscandoBancos = true;
        
        return $http.get($apis.getUrl($apis.util.bancos, 
                                [$scope.token, 0, /*$campos.util.bancos.NomeExtenso*/ 102, 0, 10, 1],
                                {id: /*$campos.util.bancos.NomeExtenso*/ 102, valor: texto + '%'}))
                 .then(function(dados){
                        $scope.buscandoBancos = false;
                        return dados.data.Registros;
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao obter bancos (' + failData.status + ')', true, 'danger', true);

                     $scope.buscandoBancos = false;
                     return [];
              });          
    }
                                                 
                                                 
    // BUSCA CONTAS CORRENTES                                                                                     
                                           
    /**
      * Busca as contas correntes
      */
    var buscaContas = function(){
        
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        $scope.showProgress(divPortletBodyContasPos);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.contas = dados.Registros;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.contas.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyContasPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyContasPos);
              });       
    };
        
                                                 
                                                 
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(){

       var filtros = [];

       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1}); 

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.cdGrupo*/ 116, 
                       valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 //else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
              });     
    };                                             
    
    
                                                 
    // Valida CNPJ
    /*$scope.cnpjValido = function(){
        return cnpjValido;    
    }                                              
    $scope.validaCNPJ = function(force){
        if($scope.modalConta.nrCnpj && $scope.modalConta.nrCnpj.length == 14){
            if(!force && old !== null && old.empresa.nu_cnpj === $scope.modalConta.nrCnpj){ 
                // Não alterou o cnpj
                $('#labelCNPJInvalido').hide();
                cnpjValido = true;
                $('#icon-cnpj').hide(); // sem exibir o ícone
                return;
            }
            
            $scope.validandoCNPJ = true;
            
            var filtro = [{id:/*$campos.cliente.empresa.nu_cnpj* / 100, valor:$scope.modalConta.nrCnpj}];
            // O CNPJ é validado em relação às filiais do grupo associado
            if($scope.usuariologado.grupoempresa) 
                filtro.push({id:/*$campos.cliente.empresa.id_grupo* / 116, 
                             valor:$scope.usuariologado.grupoempresa.id_grupo});
            

            $webapi.get($apis.getUrl($apis.cliente.empresa, [$scope.token, 0], filtro))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length == 0){ 
                                $('#labelCNPJInvalido').show();
                                cnpjValido = false;
                                $('#icon-cnpj').show();
                            }else{
                                $scope.modalConta.filial = dados.Registros[0].ds_fantasia;
                                $('#labelCNPJInvalido').hide();
                                cnpjValido = true;
                                $('#icon-cnpj').show();
                            }
                            $scope.validandoCNPJ = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR CNPJ");
                            $scope.validandoCNPJ = false;
                        });
        }else
            cnpjValido = false;  
        
    };   */                                            
                                                 
                   
                                                 
    $scope.ehCadastro = function(){
        return old === null;
    }                                             
     
    // AÇÕES
    var exibeModalConta = function(){
        $('#modalConta').modal('show');       
    }
    var fechaModalConta = function(){
        $('#modalConta').modal('hide');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de nova conta
      */
    $scope.novaConta = function(){
        $scope.modalConta.titulo = 'Nova Conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
        $scope.modalConta.textoConfirma = 'Cadastrar';
        $scope.modalConta.funcaoConfirma = salvarConta;
        //$scope.modalConta.buscaBanco = '';
        $scope.modalConta.banco = undefined;
        $scope.modalConta.nrAgencia = '';
        $scope.modalConta.nrConta = '';
        $scope.modalConta.flAtivo = true;
        //$scope.modalConta.nrCnpj = '';
        $scope.modalConta.filial = $scope.filiais[0];
        
        old = null;
        // Esconde os texto e ícone de erro de cnpj
        /*$('#labelCNPJInvalido').hide();
        $('#icon-cnpj').hide(); 
        // Ajusta o valor do flag
        cnpjValido = false;*/
        
        // Exibe o modal
        exibeModalConta();
    };
         
            
    /**
      * Valida as informações preenchidas no modal
      */                                             
    var camposModalValidos = function(){
        // Valida
        if(!$scope.modalConta.banco || !$scope.modalConta.banco.Codigo){
            $scope.showModalAlerta('Informe o banco!');
            return false;
        }
        if(!$scope.modalConta.nrAgencia){
            $scope.showModalAlerta('Informe a agência!');
            return false;
        }
        if(!$scope.modalConta.nrConta){
            $scope.showModalAlerta('Informe a conta!');
            return false;
        }
        /*if(!$scope.cnpjValido()){
            $scope.showModalAlerta('Informe um CNPJ associado a empresa ' +
                                   $scope.usuariologado.grupoempresa.ds_nome.toUpperCase() + 
                                   ' que esteja armazenado na base!');
            return false;
        }   */
        if(!$scope.modalConta.filial){
            $scope.showModalAlerta('É necessário selecionar uma filial!');
            return false;
        }
        return true;
    }
                                                 
                                                 
    /**
      * Valida as informações preenchidas e envia para o servidor
      */
    var salvarConta = function(){
         // Não faz nada se tiver validando o CNPJ
        if($scope.validandoCNPJ) return;
        
        // Valida campos
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var jsonConta = { cdGrupo : $scope.usuariologado.grupoempresa.id_grupo,
                          nrCnpj : $scope.modalConta.filial.nu_cnpj,//nrCnpj,
                          cdBanco : $scope.modalConta.banco.Codigo, 
                          nrAgencia : $scope.modalConta.nrAgencia,
                          nrConta : $scope.modalConta.nrConta
                        };
        //console.log(jsonConta);
        
        // POST
        $scope.showProgress();
        $webapi.post($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                 {id : 'token', valor : $scope.token}), jsonConta) 
            .then(function(dados){           
                $scope.showAlert('Conta cadastrada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalConta();
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 500) $scope.showAlert('Conta já cadastrada!', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao cadastrar conta (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
                                                 
    
    /**
      * Altera os dados da conta
      */
    $scope.editarConta = function(conta){
        
        old = conta;
        
        $scope.modalConta.titulo = 'Altera conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
        $scope.modalConta.textoConfirma = 'Alterar';
        $scope.modalConta.funcaoConfirma = alterarConta;
        //$scope.modalConta.buscaBanco = '';
        $scope.modalConta.banco = conta.banco;
        $scope.modalConta.nrAgencia = conta.nrAgencia;
        $scope.modalConta.nrConta = conta.nrConta;
        $scope.modalConta.flAtivo = conta.flAtivo;
        //$scope.modalConta.nrCnpj = conta.empresa.nrCnpj;
        $scope.modalConta.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === conta.empresa.nu_cnpj;})[0];
        
        /* Esconde os texto e ícone de erro de cnpj
        $('#labelCNPJInvalido').hide();
        $('#icon-cnpj').hide(); 
        cnpjValido = true;
        
        $scope.validaCNPJ(true); // força a busca pelo CNPJ para obter o nome da filial*/
        
        // Exibe o modal
        exibeModalConta();      
    };
    /**
      * Valida as informações alteradas e envia para o servidor
      */                                             
    var alterarConta = function(){
        // Não faz nada se tiver validando o CNPJ
        if($scope.validandoCNPJ) return;
        
        // Valida campos
        if(typeof old === 'undefined' || old === null) return;
        
        // Houve alterações?
        if($scope.modalConta.nrConta === old.nrConta &&
           $scope.modalConta.nrAgencia === old.nrAgencia &&
           $scope.modalConta.nrConta === old.nrConta &&
           $scope.modalConta.banco.Codigo === old.banco.Codigo &&
           $scope.modalConta.filial && old.empresa && 
           $scope.modalConta.filial.nu_cnpj === old.empresa.nu_cnpj){//nrCnpj === old.empresa.nu_cnpj){
            // Não houve alterações
            fechaModalConta();
            return;
        }
        
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var jsonConta = { cdContaCorrente : old.cdContaCorrente,
                          nrCnpj : $scope.modalConta.filial.nu_cnpj,//nrCnpj,
                          cdBanco : $scope.modalConta.banco.Codigo, 
                          nrAgencia : $scope.modalConta.nrAgencia,
                          nrConta : $scope.modalConta.nrConta,
                          flAtivo : $scope.modalConta.flAtivo
                        };
        //console.log(jsonConta);
        
        // UPDATE
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                 {id : 'token', valor : $scope.token}), jsonConta) 
            .then(function(dados){           
                $scope.showAlert('Conta alterada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalConta();
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar conta (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
    
   /**
     * Solicita confirmação para excluir a conta
     */
    $scope.excluirConta = function(conta){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir a conta?',
                                     excluiConta, conta.cdContaCorrente, 'Sim', 'Não');  
    };                   
    /**
      * Efetiva a exclusão da conta
      */
    var excluiConta = function(cdContaCorrente){
         // Exclui
         $webapi.delete($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'cdContaCorrente', valor: cdContaCorrente}]))
                .then(function(dados){           
                    $scope.showAlert('Conta excluída com sucesso!', true, 'success', true);
                    // Fecha os progress
                    $scope.hideProgress();
                    // Relista
                    buscaContas();
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Conta não pode ser excluída!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a conta (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress();
                  });         
    }
    
    
    
    // ASSOCIAÇÃO DA CONTA ÀS ADQUIRENTES-FILIAIS
    /**
      * Exibe um modal com as filiais vinculadas a conta e possibilita vincular outras
      */
    $scope.vigencias = function(conta){
        $scope.goAdministrativoContasCorrentesVigencias({conta : conta, adquirentesempresas: adquirentesempresas});
    };
                                                 
    
    var buscaLoginAdquirenteEmpresa = function(){
        $webapi.get($apis.getUrl($apis.card.tbloginadquirenteempresa, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbloginadquirenteempresa.empresa + $campos.cliente.empresa.ds_fantasia - 100 */
                                 304, 0],
                                 [{id: /*$campos.card.tbloginadquirenteempresa.cdGrupo*/ 102, 
                                  valor: $scope.usuariologado.grupoempresa.id_grupo}/*,
                                  {id: /*$campos.card.tbloginadquirenteempresa.stLoginAdquirente* / 108, 
                                  valor: 1}*/])) // somente as com status okay
            .then(function(dados){           
                adquirentesempresas = dados.Registros;
                //console.log($scope.modalAdquirenteEmpresa.adquirentesempresa);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter registros adquirente-filial associados a empresa (' + failData.status + ')', true, 'danger', true);
              });           
    }
    
    
    // ATIVAR/DESATIVAR
    $scope.desativar = function(conta){
        var jsonConta = { cdContaCorrente : conta.cdContaCorrente,
                          flAtivo : false,
                          nrCnpj : conta.empresa.nu_cnpj,
                        };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja desativar a conta?',
                                     alteraStatusConta, jsonConta, 'Sim', 'Não'); 
    }
    $scope.ativar = function(conta){
        var jsonConta = { cdContaCorrente : conta.cdContaCorrente,
                          flAtivo : true,
                          nrCnpj : conta.empresa.nu_cnpj,
                        };
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja ativar a conta?',
                                     alteraStatusConta, jsonConta, 'Sim', 'Não');    
    }
    /**
      * Efetiva a alteração do status da conta
      */
    var alteraStatusConta = function(jsonConta){
        $scope.showProgress(divPortletBodyContasPos);
        $webapi.update($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                 {id : 'token', valor : $scope.token}), jsonConta) 
            .then(function(dados){           
                $scope.showAlert('Status da conta alterado com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress(divPortletBodyContasPos);
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar status da conta (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress(divPortletBodyContasPos);
              });       
    }
    
    /**
      * Acessa os extratos bancários da conta
      */
    $scope.extrato = function(conta){
        $scope.goAdministrativoExtratosBancarios({conta: conta});    
    }
    
}]);