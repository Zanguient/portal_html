/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("usuario-sem-link", []) 

.controller("usuario-sem-linkCtrl", ['$scope','$state', function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.usuarioSemLinkInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Usuário sem acesso';                          
        $scope.pagina.subtitulo = '';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
    };    
}]);