/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 25/11/2015
 *  - Totais
 *
 *  Versão 1.0.1 - 23/11/2015
 *  - Consulta títulos da base da atos
 *
 *  Versão 1.0 - 18/11/2015
 *
 */

// App
angular.module("administrativo-titulos", []) 

.controller("administrativo-titulosCtrl", ['$scope',
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
    $scope.titulos = [];                                            
    $scope.filtro = { data : new Date(),
                     itens_pagina : $scope.itens_pagina[0], order : 0, 
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };   
    $scope.total = { valorTotal : 0.0, totalBaixados : 0, totalConciliados : 0};                                             
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyTitulosPos = 1;                                                    
    // Permissões                                           
    //var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;
    // Flags
    $scope.exibeTela = false;  
    $scope.abrirCalendarioData = false;                                              
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_titulosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Títulos';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // ....
                }else{ // reseta filiais e refaz a busca dos parâmetros 
                    $scope.titulos = [];
                }
                
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            //permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // ...
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar títulos
      */
    $scope.usuarioPodeCadastrarTitulos = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar títulos
      * /
    $scope.usuarioPodeAlterarTitulos = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir títulos
      * /
    $scope.usuarioPodeExcluirTitulos = function(){
        return permissaoRemocao;
    }  */                                            
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaTitulos();
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
        if($scope.titulos.length > 0) buscaTitulos();
    }; 
                                                 
                                                 
                                                 
    // DATA
    $scope.exibeCalendarioData = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioData = !$scope.abrirCalendarioData;
      };
    $scope.alterouData = function(){
      //
    };                                          
                                                 
    
        
    // BUSCA TÍTULOS
    /**
      * Faz a busca baseado nos filtros selecionados
      */
    $scope.buscaTitulos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        buscaTitulos();    
    }
    
    /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Data
        filtros.push({id: /*$campos.card.tbrecebimentotitulo.dtTitulo*/ 109,
                      valor: $scope.getFiltroData($scope.filtro.data)});
        
        
        return filtros;
    }
                                           
    /**
      * Busca títulos
      */
    var buscaTitulos = function(progressosemexecucao){

        if(!progressosemexecucao){
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyTitulosPos);
        }
        
        // Filtro  
        var filtros = obtemFiltrosBusca();
        
        $webapi.get($apis.getUrl($apis.card.tbrecebimentotitulo,//$apis.card.tituloserp, 
                                [$scope.token, 3,//0, 
                                 /*$campos.card.tituloserp.data*/ 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                $scope.total.totalBaixados = $scope.total.totalConciliados = 0;
                $scope.total.valorTotal = 0.0;
            
                // Obtém os dados
                $scope.titulos = dados.Registros;
                $scope.total.totalBaixados = dados.Totais.totalBaixados;
                $scope.total.totalConciliados = dados.Totais.totalConciliados;
                $scope.total.valorTotal = dados.Totais.valorTotal;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.titulos.length === 0) $scope.filtro.faixa_registros = '0-0';
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
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao carregar títulos (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              });  
    };
                                                 
                                                 
    // IMPORTA TÍTULOS
    $scope.importaTitulos = function(){

        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyTitulosPos);
        
        // Requisita 
        $webapi.post($apis.getUrl($apis.card.tituloserp, undefined,
                                  {id : 'token', valor: $scope.token}), 
                                  {data: $scope.getFiltroData($scope.filtro.data)}) 
            .then(function(dados){           

                $scope.showAlert('Títulos importados com sucesso!', true, 'success', true);
                
                buscaTitulos(true);
                // Fecha o progress
                // $scope.hideProgress(divPortletBodyFiltrosPos);
                // $scope.hideProgress(divPortletBodyTitulosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('O servidor está demorando muito para responder. O processo de importação ainda está sendo realizado. Por favor, realize a consulta dos títulos mais tarde.', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(failData.status === 401) $scope.showModalAlerta(failData.dados);
                 else $scope.showAlert('Houve uma falha ao obter carregar títulos (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyTitulosPos);
              });  
    }                                             
                       
    
    
}]);