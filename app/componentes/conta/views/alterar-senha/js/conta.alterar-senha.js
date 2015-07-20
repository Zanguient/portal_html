/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("conta-alterar-senha", []) 

.controller("conta-alterar-senhaCtrl", ['$scope','$state', function($scope,$state){ 
                                                        
    // Inicialização do controller
    $scope.contaAlterarSenhaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Minha Conta';                          
        $scope.pagina.subtitulo = 'Alterar Senha';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
    };    
}]);