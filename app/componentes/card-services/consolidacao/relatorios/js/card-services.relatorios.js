/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-relatorios", []) 

.controller("card-services-relatoriosCtrl", ['$scope','$state',function($scope,$state){ 
    
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
    
}]);