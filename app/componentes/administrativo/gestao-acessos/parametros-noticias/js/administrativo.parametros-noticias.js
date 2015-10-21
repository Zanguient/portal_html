/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 29/09/2015
 *   - Listagem dos Catálogos
 *
 *  Versão 1.0 - 29/09/2015
 *
 */

// App
angular.module("administrativo-parametros-noticias", []) 

.controller("administrativo-parametros-noticiasCtrl", ['$scope',
                                            '$state',
                                            '$filter',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            function($scope,$state,$filter,/*$campos,*/$webapi,$apis){ 
   
    
    $scope.itens_pagina = [50, 100, 150, 200];
    
    $scope.catalogos = [];                                            
    //$scope.filtro = {catalogo = null};                                            
    
    $scope.usuarios = [];                                            
    // flags
    $scope.exibeTela = false;                                            
                                                
    // Inicialização do controller
    $scope.administrativoParametrosNoticiasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Parâmetros Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca Usuários
            //$scope.buscaCatalogos();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Usuários
        //$scope.buscaUsuarios();
        
        
    };
    
    var obtemCatalogos = function(funcaoSucesso){
    //$scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
    //$scope.showProgress(divPortletBodyManifestoPos);


    $webapi.get($apis.getUrl($apis.administracao.tbcatalogo, [$scope.token, 0])) 
        .then(function(dados){
            // Obtém os dados
            $scope.catalogos = undefined;

            if(dados.Registros.length > 0){ 
                $scope.catalogos = dados.Registros;
                console.log(dados);

            }

            if(typeof funcaoSucesso === 'function') funcaoSucesso();

            // Fecha os progress
            //$scope.hideProgress(divPortletBodyFiltrosPos);
            //$scope.hideProgress(divPortletBodyManifestoPos);
          },
          function(failData){
            if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
             else $scope.showAlert('Houve uma falha ao obter os catálogos (' + failData.status + ')', true, 'danger',true);
             //$scope.hideProgress(divPortletBodyFiltrosPos);
             //$scope.hideProgress(divPortletBodyManifestoPos);
          });     
    }
       
       
    obtemCatalogos();  
    //console.log(catalogos);   
                                                
    
    var obtemUsuarios = function(funcaoSucesso){
    //$scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
    //$scope.showProgress(divPortletBodyManifestoPos);


    $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 2])) 
        .then(function(dados){
            // Obtém os dados
            $scope.usuarios = undefined;

            if(dados.Registros.length > 0){ 
                $scope.usuarios = dados.Registros;
                console.log(dados);

            }

            if(typeof funcaoSucesso === 'function') funcaoSucesso();

            // Fecha os progress
            //$scope.hideProgress(divPortletBodyFiltrosPos);
            //$scope.hideProgress(divPortletBodyManifestoPos);
          },
          function(failData){
            if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
             else $scope.showAlert('Houve uma falha ao obter os catálogos (' + failData.status + ')', true, 'danger',true);
             //$scope.hideProgress(divPortletBodyFiltrosPos);
             //$scope.hideProgress(divPortletBodyManifestoPos);
          });     
    }
       
       
    obtemUsuarios();  
    //console.log(catalogos);                                            
                                                
}])