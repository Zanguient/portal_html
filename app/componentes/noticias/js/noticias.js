/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 04/01/2016
 *
 */

// App
angular.module("noticias", []) 

.controller("noticiasCtrl", ['$scope',
                              '$state',
                              '$window',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$window,$webapi,$apis){ 
    
    $scope.linkBootICard = "http://icard.atoscapital.com.br/installer-boot-icard-windows.rar";
    $scope.noticias = [];                               
    // Flags
    $scope.exibeTela = false;                           
                                
    // Inicialização do controller
    $scope.noticiasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Notícias';                          
        $scope.pagina.subtitulo = 'Novidades';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
    }
    
    
    
    $scope.downloadBootICard = function(){
        $window.open($scope.linkBootICard, "_blank");
    }
    
}]);