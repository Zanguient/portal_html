/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("nao-autorizado", []) 

.controller("nao-autorizadoCtrl", ['$scope','$state', function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.naoAutorizadoInit = function(){
        // Título da página : Deixa o que gostaria que aparecesse...
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
    };    
}]);