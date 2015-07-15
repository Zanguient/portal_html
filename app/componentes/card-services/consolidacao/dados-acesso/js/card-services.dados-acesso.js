/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-dados-acesso", []) 

.controller("card-services-dados-acessoCtrl", ['$scope','$state',function($scope,$state){ 
    
    $scope.tab = 0;
    
    // Inicialização do controller
    $scope.cardServices_dadosAcessoInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Dados de Acesso';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };
    
    $scope.setTab = function(tab){
        if(typeof tab === 'number' && tab >= 0 && tab < 3) $scope.tab = tab;
    }
    
    $scope.tabIs = function(tab){
        return $scope.tab === tab;
    }
    
}]);