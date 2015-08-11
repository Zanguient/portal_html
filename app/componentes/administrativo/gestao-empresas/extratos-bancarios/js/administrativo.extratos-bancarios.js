/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-extratos-bancarios", []) 

.controller("administrativo-extratos-bancariosCtrl", ['$scope',
                                             '$state',
                                             '$stateParams',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$stateParams,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
                                                
    // Filtros
    $scope.extrato = [];
    $scope.contas = [];                                             
    $scope.filtro = {conta : null };
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyExtratosPos = 1; // posição da div que vai receber o loading progress                                         
    // flag
    $scope.exibePrimeiraLinha = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_extratosBancariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Extratos Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Avalia grupo empresa
            if($scope.usuariologado.grupoempresa){ 
                // Reseta seleção de filtro específico de contas
                $scope.filtro.conta = null;
                buscaContas();
            }else{ // reseta tudo e não faz buscas 
                $scope.extratos = []; 
                $scope.contas = [];
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;  
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        
        // Tem parâmetro?
        if($stateParams.conta !== null)
            $scope.filtro.conta = $stateParams.conta;
            
        // Carrega contas
        if($scope.usuariologado.grupoempresa) buscaContas();
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar extratos
      */
    $scope.usuarioPodeCadastrarExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar extratos
      */
    $scope.usuarioPodeAlterarExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir extratos
      */
    $scope.usuarioPodeExcluirExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoRemocao;
    }                                              
                                                 
    
    
                                                 
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){

        $scope.filtro.conta = null; 

        if($scope.contas.length > 0 && $scope.filtro.conta !== $scope.contas[0]){
            $scope.filtro.conta = $scope.contas[0]; 
            buscaExtrato();
        }
    }
    
    // CONTAS
    $scope.getNomeAmigavelConta = function(conta){
        if(!conta || conta === null) return '';
        var text = conta.banco.Codigo + ' ' + conta.banco.NomeExtenso + ' ' +
                   String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                   'Ag. ' + conta.nrAgencia + ' Ct. ' + conta.nrConta;
        return text.toUpperCase();
    }
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
        
        $scope.showProgress(divPortletBodyFiltrosPos);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém as contas correntes
                $scope.contas = dados.Registros;
            
                $scope.filtro.conta = $scope.contas[0];
                
                //buscaExtratos(true);
            
                // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(){
        console.log("alterou conta");
        //buscaExtratos();
    };
    
                                                                                         
    // EXTRATO
    /**
      * Busca os extratos
      */
    $scope.buscaExtratos = function(){
        console.log("busca extratos"); 
        $scope.hideProgress(divPortletBodyFiltrosPos);
    }
                                                 
    
                     
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
       // Filial
       var filtroFilial = {id: /*$campos.pos.loginoperadora.cnpj*/ 105, 
                           valor: $scope.filtro.filial.nu_cnpj};
       filtros.push(filtroFilial);  
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: /*$campos.pos.loginoperadora.idOperadora*/ 106, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.status !== null){
           var filtroStatus = {id: /*$campos.pos.loginoperadora.status*/ 104, 
                               valor: $scope.filtro.status.status};
           filtros.push(filtroStatus);
       }
       
       // Retorna    
       return filtros;
    };  
                                                                                        
                                                 
                                                 
    /**
      * Efetiva a busca
      */
    var buscaDadosDeAcesso = function(progressoemexecucao){
        
        if(!$scope.filtro.conta || $scope.filtro.conta === null) return;
       
        
       // PEGAR PERÍODO...    
        
       /*if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
       $scope.showProgress(divPortletBodyFiltrosPos);
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.filtro.filial !== null) filtros = {id: 300,
                                                    //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                                                    valor: $scope.filtro.filial.nu_cnpj};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, /*$campos.card.tbextrato.* / 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyExtratosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter extratos bancários (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyExtratosPos);
              });   */           
    };
                                                 

    
}]);