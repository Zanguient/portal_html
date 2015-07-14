/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-relatorios", []) 

.controller("card-services-relatoriosCtrl", ['$scope','$state',function($scope,$state){ 
    
    $scope.tab = 0;
    
    // Inicialização do controller
    $scope.cardServices_relatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Relatórios';
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