/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("nao-autorizado", []) 

.controller("nao-autorizadoCtrl", ['$scope','$state', function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.naoAutorizadoInit = function(){
        // Título da página : Deixa o que gostaria que aparecesse...
        //$scope.pagina.titulo = 'Não autorizado';                          
        //$scope.pagina.subtitulo = '';
    };
    
}]);