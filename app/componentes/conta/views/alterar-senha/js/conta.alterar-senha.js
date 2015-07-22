/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("conta-alterar-senha", []) 

.controller("conta-alterar-senhaCtrl", ['$scope',
                                        '$state',
                                        '$webapi',
                                        '$apis', 
                                        function($scope,$state,$webapi,$apis){ 
    var divPortletBodyAlteraSenhaPos = 0;   
    $scope.oldPassword = '';
    $scope.newPassword = '';
    $scope.confirmPassword = '';
    
    // Inicialização do controller
    $scope.contaAlterarSenhaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Minha Conta';                          
        $scope.pagina.subtitulo = 'Alterar Senha';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
    };  
    
    
    /**
      * Volta para minha conta
      */
    $scope.cancela = function(){
        $scope.goMinhaConta();    
    };
    /**
      * Salva a senha
      */                                        
    $scope.salvaSenha = function(){
        // Valida a senha
        if($scope.newPassword !== $scope.confirmPassword){
            $scope.showModalAlerta('Nova senha e confirmação não conferem!');
            return;    
        }
        if($scope.newPassword.length < 6){
            $scope.showModalAlerta('Nova senha deve conter no mínimo 6 caracteres!');
            return;     
        }
        atualizaSenha();
    };
    /**
      * Altera efetivamente a senha
      */
    var atualizaSenha = function(){
        $scope.showProgress(divPortletBodyAlteraSenhaPos);
        // JSON
        var jsonAlteraSenha = {userId: -1, senhaAtual: $scope.oldPassword, novaSenha: $scope.newPassword};
        // Update
        $webapi.update($apis.getUrl($apis.administracao.webpagesmembership, undefined,
                       {id: 'token', valor: $scope.token}), jsonAlteraSenha)
            .then(function(dados){
                    $scope.showAlert('Senha alterada com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                    // Volta para a tela anterior
                    // ...
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 500) $scope.showModalAlerta('Senha atual incorreta!');    
                     else $scope.showAlert('Houve uma falha ao alterar a senha do usuário (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyAlteraSenhaPos);
                  });    
    };
                                            
                                            
}]);