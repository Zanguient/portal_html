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
angular.module("nao-encontrado", []) 

.controller("nao-encontradoCtrl", ['$scope','$state', function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.naoEncontradoInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Página não encontrada';                          
        $scope.pagina.subtitulo = '';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
    };    
}]);