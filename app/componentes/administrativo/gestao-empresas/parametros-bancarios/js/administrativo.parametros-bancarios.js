/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-parametros-bancarios", []) 

.controller("administrativo-parametros-bancariosCtrl", ['$scope',
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
    $scope.itens_pagina = [10, 20, 50, 100]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.parametros = [];
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyContasPos = 0; // posição da div que vai receber o loading progress
    // Modal Conta
    $scope.modalParametro = { titulo : '', banco : undefined, flAtivo : true,
                              nrAgencia : '', nrConta : '', nrCnpj : '', filial: '',
                              textoConfirma : '', funcaoConfirma : function(){} };
    var old = null;    
    
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // Flags
    $scope.buscandoBancos = false; 
    $scope.exibeTela = false;                                             
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_parametrosBancariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Parâmetros Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
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
            // Carrega parâmetros
            //buscaParametros();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar parâmetros bancários
      */
    $scope.usuarioPodeCadastrarParametros = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar parâmetros bancários
      */
    $scope.usuarioPodeAlterarParametros = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir parâmetros bancários
      */
    $scope.usuarioPodeExcluirParametros = function(){
        return permissaoRemocao;
    }                                              
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           //buscaParametros();
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
        //buscaParametros();
    }; 
                                                 
            
    
    // BUSCA BANCOS  
    /**
      * Exibe o código do banco seguido do nome (reduzido ou extenso)
      */
    $scope.exibeBanco = function(banco, reduzido){
        if(typeof banco === 'undefined') return '';
        var text = banco.Codigo + '    ';
        if(reduzido) text += banco.NomeReduzido;   
        else text += banco.NomeExtenso;
        return text.toUpperCase();
    }
    /**
      * Selecionou um banco
      */
    $scope.selecionouBanco = function(){
        //console.log($scope.modalConta.banco);    
    }
    /**
      * Busca o banco digitado
      */
    $scope.buscaBancos = function(texto){
        $scope.buscandoBancos = true;
        
        return $http.get($apis.getUrl($apis.utils.bancos, 
                                [$scope.token, 0, /*$campos.utils.bancos.NomeExtenso*/ 102, 0, 10, 1],
                                {id: /*$campos.utils.bancos.NomeExtenso*/ 102, valor: texto + '%'}))
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
      * Busca parâmetros bancários
      */
    var buscaParametros = function(){
        
        $scope.showProgress(divPortletBodyContasPos);
        
        // Filtro  
        /*var filtros = obtemFiltrosBusca();
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco* / 103, 0, 
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
              });  */     
    };
        
                                                 
                                                
                      
                                                 
                   
                                                 
    $scope.ehCadastro = function(){
        return old === null;
    }                                             
     
    // AÇÕES
    var exibeModalParametroBancario = function(){
        $('#modalParametroBancario').modal('show');       
    }
    var fechaModalParametroBancario = function(){
        $('#modalParametroBancario').modal('hide');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de novo parâmetro bancarios
      */
    $scope.novoParametroBancario = function(){
        /*$scope.modalConta.titulo = 'Nova Conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
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
        
        // Exibe o modal
        exibeModalParametroBancario();*/
    };
         
            
    /**
      * Valida as informações preenchidas no modal
      */                                             
    var camposModalValidos = function(){
        // Valida
        /*if(!$scope.modalConta.banco){
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
        if(!$scope.modalConta.filial){
            $scope.showModalAlerta('É necessário selecionar uma filial!');
            return false;
        }*/
        return true;
    }
                                                 
                                                 
    /**
      * Valida as informações preenchidas e envia para o servidor
      */
    var salvarParametroBancario = function(){

        // Valida campos
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        /*var jsonConta = { cdGrupo : $scope.usuariologado.grupoempresa.id_grupo,
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
              });   */
    }
                                                 
    
    /**
      * Altera os dados do parâmetro bancário
      */
    $scope.editarParametroBancario = function(parametro){
        
        /*old = parametro;
        
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
        
        // Exibe o modal
        exibeModalParametroBancario();   */   
    };
    /**
      * Valida as informações alteradas e envia para o servidor
      */                                             
    var alterarParametroBancario = function(){

        // Valida campos
        if(typeof old === 'undefined' || old === null) return;
        
        // Houve alterações?
        /*if($scope.modalConta.nrConta === old.nrConta &&
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
              });   */
    }
    
   /**
     * Solicita confirmação para excluir o parâmetro bancário
     */
    $scope.excluirParametroBancario = function(parametro){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir o parâmetro bancário?',
                                     excluiParametroBancario, 
                                    {cdBanco : parametro.cdBanco,
                                     dsMemo: parametro.dsMemo}, 'Sim', 'Não');  
    };                   
    /**
      * Efetiva a exclusão do parâmetro bancário
      */
    var excluiParametroBancario = function(json){
         // Exclui
         /*$webapi.delete($apis.getUrl($apis.card.tbcontacorrente, undefined,
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
                  });         */
    }
    
}]);