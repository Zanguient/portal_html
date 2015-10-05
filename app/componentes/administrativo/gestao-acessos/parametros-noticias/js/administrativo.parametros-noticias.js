/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
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
                                                
    //$scope.filtro = {catalogos = null};                                            
    
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
            $scope.buscaCatalogos();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca Usuários
        //$scope.buscaUsuarios();
        
        
    };
    
       
}])