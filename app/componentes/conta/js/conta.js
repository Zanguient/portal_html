/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("conta", []) 

.controller("contaCtrl", ['$scope','$state', function($scope,$state){ 
    
    $scope.tab = 1;
    
    // Inicialização do controller
    $scope.contaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Minha Conta';                          
        $scope.pagina.subtitulo = '';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
    }; 
    
    //TAB
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 2) $scope.tab = tab;        
    }
    
}]);