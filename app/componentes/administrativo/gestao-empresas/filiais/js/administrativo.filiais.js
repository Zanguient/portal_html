/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-filiais", []) 

.controller("administrativo-filiaisCtrl", ['$scope','$state',function($scope,$state){ 

    // Inicialização do controller
    $scope.administrativo_filiaisInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Filiais';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };
    
}]);